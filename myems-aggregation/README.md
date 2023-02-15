## myems-aggregation

Data Aggregation Service 

数据汇总服务

## Introduction

This service is a component of MyEMS to aggregate normalized data up to multiple dimensions.

## Dependencies

mysql-connector-python

python-decouple


## Quick Run for Development

```bash
cd myems/myems-aggregation
pip install -r requirements.txt
cp example.env .env
chmod +x run.sh
./run.sh
```

## Installation

### Option 1: Install myems-aggregation on Docker

Refer to [myems.io](https://myems.io/docs/installation/docker-linux#step-7-myems-aggregation)

### Option 2: Online install myems-aggregation on Ubuntu Server with internet access

Refer to [myems.io](https://myems.io/docs/installation/debian-ubuntu#step-7-myems-aggregation)

### Option 3: Offline install myems-aggregation on Ubuntu Server without internet access

In this section, you will install myems-aggregation on Ubuntu Server without internet access.

Download on any server with internet access:
```bash
cd ~/tools
wget https://cdn.mysql.com//Downloads/Connector-Python/mysql-connector-python-8.0.28.tar.gz
git clone https://github.com/henriquebastos/python-decouple.git
cd ~
git clone https://github.com/MyEMS/myems.git
```

Copy files to the server without internet access and install prerequisites:
```bash
cd ~/tools
tar xzf mysql-connector-python-8.0.28.tar.gz
cd ~/tools/mysql-connector-python-8.0.28
python3 setup.py install
cd ~/tools/python-decouple
python3 setup.py  install
```

Install myems-aggregation service:
```bash
cp -r myems/myems-aggregation /myems-aggregation
cd /myems-aggregation
```
Copy exmaple.env file to .env and modify the .env file:
```bash
cp /myems-aggregation/example.env /myems-aggregation/.env
nano /myems-aggregation/.env
```
Setup systemd service:
```bash
cp myems-aggregation.service /lib/systemd/system/
```
Enable the service:
```bash
systemctl enable myems-aggregation.service
```
Start the service:
```bash
systemctl start myems-aggregation.service
```
Monitor the service:
```bash
systemctl status myems-aggregation.service
```
View the log:
```bash
cat /myems-aggregation.log
```

### References

[1]. https://myems.io

[2]. https://dev.mysql.com/doc/connector-python/en/

[3]. https://github.com/henriquebastos/python-decouple/
