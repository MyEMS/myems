# MyEMS API Service

## Introduction

RESTful API service for [MyEMS](https://github.com/MyEMS/myems) components and third party applications.

## Quick Run for Development

Quick run on Linux (NOT for production use):
```bash
cd myems/myems-api
sudo pip install -r requirements.txt
cp example.env .env
sudo chmod +x run.sh
./run.sh
```

How to run on Windows (NOT for production usage):

Install python 3.10, 3.11, or 3.12

Find python path in Command Prompt:
```bash
where python
```
Assume the result is 'C:\Users\johnson\AppData\Local\Programs\Python\Python310\python.exe'

Install and run with waitress:
```bash
pip install waitress
cd myems\myems-api
waitress-serve --listen=0.0.0.0:8000 app:api
```

## Installation

### Installation Option 1: Install myems-api on Docker

Refer to [myems.cn](https://myems.cn/docs/installation/docker-linux#step-2-myems-api)

### Option 2: Online install myems-api on Ubuntu Server with internet access

Refer to [myems.cn](https://myems.cn/docs/installation/debian-ubuntu#step-2-myems-api)

### Installation Option 3: Install myems-api on macOS

Refer to [Installation on macOS (Chinese)](/myems-api/installation_macos_zh.md)


## API List

Please refer to [API List](https://myems.cn/docs/api)

## References

[1]. http://myems.cn

[2]. https://falconframework.org/
=
[3]. https://github.com/yohanboniface/falcon-multipart

[4]. http://gunicorn.org

[5]. https://github.com/henriquebastos/python-decouple/

[6]. https://foss.heptapod.net/openpyxl/openpyxl

[7]. https://foss.heptapod.net/openpyxl/et_xmlfile/

[8]. https://docs.pylonsproject.org/projects/waitress/en/latest/
