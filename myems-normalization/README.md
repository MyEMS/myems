# myems-normalization

MyEMS Normalization Service 

数据规范化服务

## Introduction

This service is a component of MyEMS. It normalizes energy data in historical database.

![MyEMS Meter Normalization](../docs/images/meter-normalization.png)

## Prerequisites

mysql-connector-python

openpyxl

sympy

python-decouple


## Quick Run for Development

```bash
cd myems/myems-normalization
pip install -r requirements.txt
cp example.env .env
chmod +x run.sh
./run.sh
```

## Installation

### Option 1: Install myems-normalization on Docker

In this section, you will install myems-normalization on Docker.

* Copy source code to root directory

On Windows:
```bash
cp -r myems/myems-normalization c:\
cd c:\myems-normalization
```

On Linux:
```bash
cp -r myems/myems-normalization /
cd /myems-normalization
```

* Duplicate example.env file as .env file and modify the .env file
Replace ~~127.0.0.1~~ with real **HOST** IP address.
```bash
cp example.env .env
```

* Build a Docker image
```bash
docker build -t myems/myems-normalization .
```
* Run a Docker container
On Windows host, bind-mount the .env to the container:
```bash
docker run -d -v c:\myems-normalization\.env:/code/.env --restart always --name myems-normalization myems/myems-normalization
```
On Linux host, bind-mount the .env to the container:
```bash
docker run -d -v /myems-normalization/.env:/.env --restart always --name myems-normalization myems/myems-normalization
```
* -d Run container in background and print container ID

* -v If you use -v or --volume to bind-mount a file or directory that does not yet exist on the Docker host, -v creates the endpoint for you. It is always created as a directory.

* --restart Restart policy to apply when a container exits

* --name Assign a name to the container

The absolute path before colon is for path on host  and that may vary on your system.
The absolute path after colon is for path on container and that CANNOT be changed.
By passing .env as bind-mount parameter, you can change the configuration values later.
If you changed .env file, restart the container to make the change effective.

If you want to immigrate the image to another computer,
* Export image to tarball file
```bash
docker save --output myems-normalization.tar myems/myems-normalization
```
* Copy the tarball file to another computer, and then load image from tarball file
```bash
docker load --input .\myems-normalization.tar
```

### Installation Option 2: Online install on Ubuntu server with internet access

In this section, you will install myems-normalization on Ubuntu Server with internet access.

```bash
cp -r myems-normalization /myems-normalization
cd /myems-normalization
pip install -r requirements.txt -i http://mirrors.aliyun.com/pypi/simple/ --trusted-host mirrors.aliyun.com
```

Copy exmaple.env file to .env and modify the .env file:
```bash
cp /myems-normalization/example.env /myems-normalization/.env
nano /myems-normalization/.env
```
Setup systemd service:
```bash
cp myems-normalization.service /lib/systemd/system/
```
Enable the service:
```bash
systemctl enable myems-normalization.service
```
Start the service:
```bash
systemctl start myems-normalization.service
```
Monitor the service:
```bash
systemctl status myems-normalization.service
```
View the log:
```bash
cat /myems-normalization.log
```

### Installation Option 3: Offline install on Ubuntu server without internet access

In this section, you will install myems-normalization on Ubuntu Server.

Download and install MySQL Connector:
```bash
cd ~/tools
wget https://cdn.mysql.com//Downloads/Connector-Python/mysql-connector-python-8.0.28.tar.gz
tar xzf mysql-connector-python-8.0.28.tar.gz
cd ~/tools/mysql-connector-python-8.0.28
python3 setup.py install
```

Download and install mpmath
```bash
cd ~/tools
git clone https://github.com/fredrik-johansson/mpmath.git
cd ~/tools/mpmath
python3 setup.py install
```

Download and install SymPy
```bash
cd ~/tools
git clone https://github.com/sympy/sympy.git
cd ~/tools/sympy
python3 setupegg.py develop
```

Download and install openpyxl
```bash
cd ~/tools
```
Get the latest version of et_xmlfile from https://foss.heptapod.net/openpyxl/et_xmlfile/
```bash
wget https://foss.heptapod.net/openpyxl/et_xmlfile/-/archive/1.1/et_xmlfile-1.1.tar.gz
tar xzf et_xmlfile-1.1.tar.gz
```
Get jdcal
```bash
git clone https://github.com/phn/jdcal.git
```
Get the latest version of openpyxl from https://foss.heptapod.net/openpyxl/openpyxl
```bash
wget https://foss.heptapod.net/openpyxl/openpyxl/-/archive/3.0.7/openpyxl-3.0.7.tar.gz
tar xzf openpyxl-3.0.7.tar.gz
```

```bash
cd ~/tools/et_xmlfile-1.1
python3 setup.py install
cd ~/tools/jdcal
python3 setup.py install
cd ~/tools/openpyxl-3.0.7
python3 setup.py install
```

Download and install Python Decouple
```bash
cd ~/tools
git clone https://github.com/henriquebastos/python-decouple.git
cd ~/tools/python-decouple
python3 setup.py  install
```

Install myems-normalization service:
```bash
cp -r myems/myems-normalization /myems-normalization
cd /myems-normalization
```
Copy example.env file to .env file and modify the .env file:
```bash
cp /myems-normalization/example.env /myems-normalization/.env
nano /myems-normalization/.env
```
Setup systemd service:
```bash
cp myems-normalization.service /lib/systemd/system/
```
Enable the service:
```bash
systemctl enable myems-normalization.service
```
Start the service:
```bash
systemctl start myems-normalization.service
```
Monitor the service:
```bash
systemctl status myems-normalization.service
```
View the log:
```bash
cat /myems-normalization.log
```

### References

1.  https://myems.io
2.  https://dev.mysql.com/doc/connector-python/en/
3.  https://github.com/sympy/sympy
4.  https://openpyxl.readthedocs.io
