## myems-aggregation

MyEMS Aggregation Service 

数据汇总服务

## Introduction

This service is a component of MyEMS. It aggregates normalized data up to multiple dimensions.

## Prerequisites

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

In this section, you will install myems-aggregation on Docker.

*  Copy example.env file to .env file and modify the .env file

```bash
cd myems/myems-aggregation
cp example.env .env
```
* Build a Docker image
```bash
docker build -t myems/myems-aggregation .
```
* Run a Docker container
```bash
docker run -d --restart always --name myems-aggregation myems/myems-aggregation
```

-d		Run container in background and print container ID

--restart	Restart policy to apply when a container exits

--name		Assign a name to the container

### Option 2: Install myems-aggregation on Ubuntu Server (bare-metal or virtual machine)

In this section, you will install myems-aggregation on Ubuntu Server.

Download and install MySQL Connector:
```bash
cd ~/tools
wget https://cdn.mysql.com/archives/mysql-connector-python-8.0/mysql-connector-python-8.0.23.tar.gz
tar xzf mysql-connector-python-8.0.23.tar.gz
cd ~/tools/mysql-connector-python-8.0.23
python3 setup.py install
```

Download and install Python Decouple
```bash
cd ~/tools
git clone https://github.com/henriquebastos/python-decouple.git
cd ~/tools/python-decouple
python3 setup.py  install
```

Install myems-aggregation service:
```bash
cd ~
git clone https://github.com/MyEMS/myems.git
cd myems
git checkout master (or the latest release tag)
cp -R ~/myems/myems-aggregation /myems-aggregation
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
