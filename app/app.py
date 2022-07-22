import os, json, requests, uvicorn, time, socket, re
import numpy as np
from urllib.parse import urlparse
import shutil, aiofiles, sys, uuid
from collections import OrderedDict
from os import environ, path
from loguru import logger
from fastapi import FastAPI, Request, File, Form, UploadFile
from fastapi.responses import UJSONResponse
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from starlette.responses import FileResponse
from starlette.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.encoders import jsonable_encoder
from starlette_exporter import PrometheusMiddleware, handle_metrics
import helpers


VT_API_KEY = os.getenv('VT_API_KEY')

IPINFO_API_KEY = os.getenv('IPINFO_API_KEY')
VT_API_ARR  = os.getenv('VT_API_KEY').split(',')


PREVIEW_PATH = 'preview'


if not os.path.exists(PREVIEW_PATH):
    os.makedirs(PREVIEW_PATH)
    response = requests.get("https://raw.githubusercontent.com/t0mer/SafeUrl/main/app/preview/error.png")
    file = open(path.join(PREVIEW_PATH,"error.png"), "wb")
    file.write(response.content)
    file.close()  



def get_random_api_key():
    api_key = np.random.choice(VT_API_ARR, size=1)[0]
    return str(api_key)

def ScanUrl(url):
    try:
        get_random_api_key()
        endpoint = 'https://www.virustotal.com/api/v3/urls'
        data = {'url':url}
        headers = {'x-apikey':get_random_api_key()}
        result = requests.post(endpoint, data=data, headers=headers)
        id = result.json()['data']['id'].split('-')[1]
        time.sleep(5)
        return GetReport(id)
    except Exception as e:
        logger.error('Error scaning url. ' + str(e))
        return JSONResponse(content = {"error":str(e),"success":"false"})

def GetReport(id):
    logger.info('Getting report for: ' + id)
    headers = {'x-apikey':get_random_api_key()}
    endpoint = 'https://www.virustotal.com/api/v3/urls/' + id
    result =  requests.get(endpoint, headers=headers)
    return result.json()

def get_ipinfo(url):
    logger.info("Getting Ipinfo for: " + url)
    ip_address = URL2IP(url)
    ipinfo_url = 'https://ipinfo.io/' + ip_address + '/json?token=' + IPINFO_API_KEY
    logger.info(ip_address)
    result =  requests.get(ipinfo_url)
    return result.json()


def GetVersionFromFle():
    with open("VERSION","r") as version:
        v = version.read()
        return v


def URL2IP(url):
    try:
        domain=url.split("//")[-1].split("/")[0] 
        return socket.gethostbyname(domain)
    except Exception as e:
        logger.error("URL2Ip error: " + str(e))
        return "0.0.0.0"



app = FastAPI(title="SafeUrl", description="Small, FastAPI based application for url reputation checks", version=GetVersionFromFle())
logger.info("Configuring app")
app.mount("/dist", StaticFiles(directory="dist"), name="dist")
app.mount("/js", StaticFiles(directory="dist/js"), name="js")
app.mount("/css", StaticFiles(directory="dist/css"), name="css")
app.mount("/preview", StaticFiles(directory="preview"), name="css")
templates = Jinja2Templates(directory="templates/")
app.add_middleware(PrometheusMiddleware)
app.add_route("/metrics", handle_metrics)


origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)




@app.get("/api/preview")
def preview(request: Request, url : str =""):
    try:
        url=helpers.check_url(url)
        logger.debug("Previewing url: " + url)
        Image = 'preview_' + str(uuid.uuid4()) +'.png'
        logger.info("Starting process")
        logger.info("URL to preview is: " + url)
        browser = helpers.GetBrowser()
        browser.get(url)
        helpers.fullpage_screenshot(browser, Image)
        helpers.log_browser(browser)
        browser.quit()
        return JSONResponse(content = '{"image_url":"'+Image+'","success":"true"}')
    except Exception as e:
        logger.error(str(e))
        return JSONResponse(content = '{"image_url":"error.png","success":"false"}')


@app.get("/analyze")
def home(request: Request, url : str =""):
    ipinfo_enabled = IPINFO_API_KEY  != ""
    return templates.TemplateResponse('analyze.html', context={'request': request,'url':url, 'ipinfo_enabled':ipinfo_enabled, 'version':GetVersionFromFle()})
    
@app.get("/api/report")
def report(request: Request, url : str =""):
    return ScanUrl(url)


@app.get("/api/ipinfo")
def ipinfo(request: Request, url : str =""):
    return get_ipinfo(url)


@app.get("/")
def home(request: Request):
    vtotal_enabled = VT_API_KEY != ""
    logger.info("Loading default page")
    return templates.TemplateResponse('index.html', context={'request': request,'version':GetVersionFromFle(), 'vtotal_enabled':vtotal_enabled })


if __name__ == '__main__':
    uvicorn.run(app, host="0.0.0.0", port=8081)


# analayze
