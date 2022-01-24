*Please :star: this repo if you find it useful*

<p align="left"><br>
<a href="https://www.paypal.com/paypalme/techblogil?locale.x=he_IL" target="_blank"><img src="http://khrolenok.ru/support_paypal.png" alt="PayPal" width="250" height="48"></a>
</p>


# SafeUrl
## Safely check the URL befor clicking it.

With the growing amount of Spam, Fishing, and Mellicues messages, I needed a tool that would help me safely check the URL before I clicked it.
Correct, there are other options like VirusTotal, but I wanted something more, like getting a Preview of the final URL or even getting IP Information of the hosted service,
So I combined them all into one lite and simple application.

## Features
With SafeUrl, you can get the following information:
*	 Report Summary Using [VirusTotal)](https://www.virustotal.com/gui/home/url)
*	Report Info.
*	Site Preview
*	Website Info:
    *	Final URL.
    *	Redirect Chain (If there are redirections).
    *	Outgoing Links.
    *	HTML Meta information.
    *	Trackers (Google Tag, Analytics, Pixels, and more).
    *	Ip Information Using [IpInfo](https://ipinfo.io/).

### Limatations
* [VirusTotal)](https://www.virustotal.com/gui/home/url) free API is limited to 4 calls/minute.
* [IpInfo](https://ipinfo.io/) free API is limited to 50,000 calls/moneh.

## Usage
### Run from hub

#### docker-compose from hub
```yaml
version: "3.6"
services:
  safeurl:
    image: techblog/safeurl
    container_name: safeurl
    restart: always
    ports:
      - "8080:8080"
    environment:
      - VT_API_KEY=[Your VirusTotal API Key] #Required
      - IPINFO_API_KEY=[Your IPInfo API Key] #Optional
```

## Checking URL
So now, after you installed SafeURL, It's time to givr it a try.
Navigate to you server address and you shuold see the following screen:

[![SafeUrl Index Page](https://raw.githubusercontent.com/t0mer/SafeUrl/main/Images/SafeUrl%20-%20Index.PNG?raw=true)](https://raw.githubusercontent.com/t0mer/SafeUrl/main/Images/SafeUrl%20-%20Index.PNG?raw=true)

Enter the Requested URL and hit the "Check URL" button.
The Scan process will start and then you will see the folllowing screen:

[![SafeUrl scan in progress](https://raw.githubusercontent.com/t0mer/SafeUrl/main/Images/SafeUrl%20-%20Scanning.PNG?raw=true)](https://raw.githubusercontent.com/t0mer/SafeUrl/main/Images/SafeUrl%20-%20Scanning.PNG?raw=true)

When the scan process will end, you will be able to see all the data collected during the scan process, Like Report summary:
[![SafeUrl scan in progress](https://raw.githubusercontent.com/t0mer/SafeUrl/main/Images/SafeUrl%20-%20Report%20Summary.PNG?raw=true)](https://raw.githubusercontent.com/t0mer/SafeUrl/main/Images/SafeUrl%20-%20Report%20Summary.PNG?raw=true)

Site preview:
[![SafeUrl scan in progress](https://raw.githubusercontent.com/t0mer/SafeUrl/main/Images/SafeUrl%20-%20Preview.PNG?raw=true)](https://raw.githubusercontent.com/t0mer/SafeUrl/main/Images/SafeUrl%20-%20Preview.PNG?raw=true)

And much much more.