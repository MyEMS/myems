# myems-cleaning
MyEMS Cleaning Service 

MyEMS 数据清洗服务


### Introduction

This service is a component of MyEMS and it cleans the historical data. 

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/ac9730a315c4436cb224dff0eedd7eaf)](https://app.codacy.com/gh/myems/myems-cleaning?utm_source=github.com&utm_medium=referral&utm_content=myems/myems-cleaning&utm_campaign=Badge_Grade)
[![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/myems/myems-cleaning/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/myems/myems-cleaning/?branch=master)
[![Maintainability](https://api.codeclimate.com/v1/badges/e81df9e97fb701e0865d/maintainability)](https://codeclimate.com/github/myems/myems-cleaning/maintainability)
[![Total alerts](https://img.shields.io/lgtm/alerts/g/myems/myems-cleaning.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/myems/myems-cleaning/alerts/)


### Prerequisites

mysql.connector


### Installation
    
Download and install MySQL Connector:
```
    $ cd ~/tools
    $ wget https://dev.mysql.com/get/Downloads/Connector-Python/mysql-connector-python-8.0.20.tar.gz
    $ tar xzf mysql-connector-python-8.0.20.tar.gz
    $ cd ~/tools/mysql-connector-python-8.0.20
    $ sudo python3 setup.py install
```

Install myems-cleaning service
```bash
    $ cd ~
    $ git clone https://github.com/myems/myems.git
    $ cd myems
    $ sudo git checkout master (or the latest release tag)
    $ sudo cp -R ~/myems/myems-cleaning /myems-cleaning
```
Open config file and edit database configuration
```bash
    $ sudo nano /myems-cleaning/config.py
```
Setup systemd service:
```bash
    $ sudo cp myems-cleaning.service /lib/systemd/system/
```
Enable the service:
```bash
    $ sudo systemctl enable myems-cleaning.service
```
Start the service:
```bash
    $ sudo systemctl start myems-cleaning.service
```

### References

1. https://myems.io
2. https://dev.mysql.com/doc/connector-python/en/