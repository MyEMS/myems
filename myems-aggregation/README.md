## MyEMS Aggregation Service 数据汇总服务



### Introduction

This service is a component of MyEMS and it aggregates normalized data up to multiple dimensions.

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

Install myems-aggregation service:
```
    $ cd ~
    $ git clone https://github.com/MyEMS/myems.git
    $ cd myems
    $ sudo git checkout master (or the latest release tag)
    $ sudo cp -R ~/myems/myems-aggregation /myems-aggregation
```
Edit config.py
```
    $ sudo nano /myems-aggregation/config.py
```
Setup systemd service:
```
    $ sudo cp myems-aggregation.service /lib/systemd/system/
```
Enable the service:
```
    $ sudo systemctl enable myems-aggregation.service
```
Start the service:
```
    $ sudo systemctl start myems-aggregation.service
```
Monitor the service:
```bash
    $ sudo systemctl status myems-aggregation.service
```
View the log:
```bash
    $ cat /myems-aggregation.log
```

### References

[1]. https://myems.io

[2]. https://dev.mysql.com/doc/connector-python/en/
