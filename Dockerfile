FROM techblog/selenium:latest

LABEL maintainer="tomer.klein@gmail.com"

ENV PYTHONIOENCODING=utf-8
ENV LANG=C.UTF-8
ENV IPINFO_API_KEY=""
ENV VT_API_KEY=""

RUN  pip3 install --upgrade pip --no-cache-dir && \
     pip3 install --upgrade setuptools --no-cache-dir

RUN mkdir -p /opt/app/preview

COPY requirements.txt /tmp

RUN pip3 install -r /tmp/requirements.txt

COPY app /opt/app

WORKDIR /opt/app/

EXPOSE 8080

ENTRYPOINT python app.py


