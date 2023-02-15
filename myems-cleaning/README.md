# myems-cleaning

MyEMS Cleaning Service 

MyEMS 数据清洗服务

## Introduction

This service is a component of MyEMS to clean the historical data. 

## Dependencies

mysql-connector-python

schedule

python-decouple

## Quick Run for Development
```bash
cd myems/myems-cleaning
pip install -r requirements.txt
cp example.env .env
chmod +x run.sh
./run.sh
```

## Installation

### Option 1: Install myems-cleaning on Docker

Refer to [myems.io](https://myems.io/docs/installation/docker-linux#step-5-myems-cleaning)

### Installation Option 2: Online install on Ubuntu server with internet access

Refer to [myems.io](https://myems.io/docs/installation/debian-ubuntu#step-5-myems-cleaning)

### Installation Option 3: Offline install on Ubuntu server without internet access

In this section, you will install myems-cleaning on Ubuntu Server.

Download and install MySQL Connector:
```bash
cd ~/tools
wget https://cdn.mysql.com//Downloads/Connector-Python/mysql-connector-python-8.0.28.tar.gz
tar xzf mysql-connector-python-8.0.28.tar.gz
cd ~/tools/mysql-connector-python-8.0.28
python3 setup.py install
```

Download and install Schedule
```bash
cd ~/tools
git clone https://github.com/dbader/schedule.git
cd ~/tools/schedule
python3 setup.py install
```

Download and install Python Decouple
```bash
cd ~/tools
git clone https://github.com/henriquebastos/python-decouple.git
cd ~/tools/python-decouple
python3 setup.py  install
```

Install myems-cleaning service
```bash
cp -r myems/myems-cleaning /myems-cleaning
cd /myems-cleaning
```
Copy file example.env to .env and edit the .env file:
```bash
cp /myems-cleaning/example.env /myems-cleaning/.env
nano /myems-cleaning/.env
```
Setup systemd service:
```bash
cp myems-cleaning.service /lib/systemd/system/
```
Enable the service:
```bash
systemctl enable myems-cleaning.service
```
Start the service:
```bash
systemctl start myems-cleaning.service
```
Monitor the service:
```bash
systemctl status myems-cleaning.service
```
View the log:
```bash
cat /myems-cleaning.log
```

### References

[1]. https://myems.io

[2]. https://dev.mysql.com/doc/connector-python/en/
