# MyEMS API Service

## Introduction

RESTful API service for [MyEMS](https://github.com/MyEMS/myems) components and third party applications.

## Dependencies

anytree

simplejson

mysql-connector-python

falcon

falcon_cors

falcon-multipart

gunicorn

et_xmlfile

jdcal

openpyxl

pillow

python-decouple

## Quick Run for Development

Quick run on Linux (NOT for production use):
```bash
cd myems/myems-api
sudo pip install -r requirements.txt -i http://mirrors.aliyun.com/pypi/simple/ --trusted-host mirrors.aliyun.com
cp example.env .env
sudo chmod +x run.sh
./run.sh
```

Quick run on Windows (NOT for production usage):

Find python path in Command Prompt:
```bash
where python
```
Assume the result is 'C:\Users\johnson\AppData\Local\Programs\Python\Python310\python.exe'

Copy fcntl.py and pwd.py to lib folder:
```bash
cp myems\myems-api\fcntl.py C:\Users\johnson\AppData\Local\Programs\Python\Python310\Lib
cp myems\myems-api\pwd.py C:\Users\johnson\AppData\Local\Programs\Python\Python310\Lib
```

Install and run with waitress:
```bash
pip install waitress
cd myems\myems-api
waitress-serve --listen=0.0.0.0:8000 app:api
```


## Installation

### Installation Option 1: Install myems-api on Docker

Refer to [myems.io](https://myems.io/docs/installation/docker-linux#step-2-myems-api)

### Option 2: Online install myems-api on Ubuntu Server with internet access

Refer to [myems.io](https://myems.io/docs/installation/debian-ubuntu#step-2-myems-api)

### Option 3: Offline install myems-api on Ubuntu Server without internet access

In this section, you will offline install myems-api on Ubuntu Server without internet access.
* Download tools 
```bash
mkdir ~tools && cd ~/tools
git clone https://github.com/c0fec0de/anytree.git
git clone https://github.com/simplejson/simplejson.git
wget https://cdn.mysql.com//Downloads/Connector-Python/mysql-connector-python-8.0.28.tar.gz
mkdir ~/tools/falcon && cd ~/tools/falcon
pip download cython falcon falcon-cors falcon-multipart
cd ~/tools
mkdir ~/tools/gunicorn && cd ~/tools/gunicorn
pip download gunicorn
cd ~/tools
wget https://foss.heptapod.net/openpyxl/et_xmlfile/-/archive/1.1/et_xmlfile-1.1.tar.gz
cd ~/tools
git clone https://github.com/phn/jdcal.git
mkdir ~/tools/pillow && cd ~/tools/pillow 
pip download Pillow
cd ~/tools
wget https://foss.heptapod.net/openpyxl/openpyxl/-/archive/3.0.7/openpyxl-3.0.7.tar.gz
cd ~/tools
git clone https://github.com/henriquebastos/python-decouple.git
```
* Copy source code and tools to the production Ubuntu Server and then run:
```bash
cd ~/tools/anytree
python setup.py install 
cd ~/tools/simplejson
python setup.py install 
cd ~/tools
tar xzf mysql-connector-python-8.0.28.tar.gz
cd ~/tools/mysql-connector-python-8.0.28
python setup.py install
export LC_ALL="en_US.UTF-8"
export LC_CTYPE="en_US.UTF-8"
dpkg-reconfigure locales
pip install --upgrade --no-index --find-links ~/tools/falcon cython falcon falcon-cors falcon-multipart
pip install --no-index --find-links ~/tools/gunicorn gunicorn
cd ~/tools
tar xzf et_xmlfile-1.1.tar.gz
cd ~/tools/et_xmlfile-1.1
python setup.py install
cd ~/tools/jdcal
python setup.py install
cd ~/tools
pip install --no-index --find-links ~/tools/pillow Pillow
tar xzf openpyxl-3.0.7.tar.gz
cd ~/tools/openpyxl-3.0.7
python setup.py install
cd ~/tools/python-decouple
python setup.py install
```

* Install  myems-api service:
```bash
cp -r myems/myems-api /myems-api
```
Create .env file based on example.env and edit the .env file if needed:
```bash
cp /myems-api/example.env /myems-api/.env
nano /myems-api/.env
```
Check or change the listening port (default is 8000) in myems-api.service and myems-api.socket:
```bash
nano /myems-api/myems-api.service
```
```bash
ExecStart=/usr/local/bin/gunicorn -b 0.0.0.0:8000 --pid /run/myems-api/pid --timeout 600 --workers=4 app:api
```
```bash
nano /myems-api/myems-api.socket
```
```bash
ListenStream=0.0.0.0:8000
```
Add port to firewall:
```bash
ufw allow 8000
```
Setup systemd configure files:
```bash
cp /myems-api/myems-api.service /lib/systemd/system/
cp /myems-api/myems-api.socket /lib/systemd/system/
cp /myems-api/myems-api.conf /usr/lib/tmpfiles.d/
```
   Next enable the services so that they autostart at boot:
```bash
  systemctl enable myems-api.socket
  systemctl enable myems-api.service
```
Start the services :
```bash
systemctl start myems-api.socket
systemctl start myems-api.service
```

### Installation Option 4: Install myems-api on macOS

Refer to [Installation on macOS (Chinese)](/myems-api/installation_macos_zh.md)


## API List

Please refer to [API List](https://myems.io/docs/api)

## References

[1]. http://myems.io

[2]. https://falconframework.org/

[3]. https://github.com/lwcolton/falcon-cors

[4]. https://github.com/yohanboniface/falcon-multipart

[5]. http://gunicorn.org

[6]. https://github.com/henriquebastos/python-decouple/

[7]. https://foss.heptapod.net/openpyxl/openpyxl

[8]. https://foss.heptapod.net/openpyxl/et_xmlfile/

[9]. https://docs.pylonsproject.org/projects/waitress/en/latest/

