# MyEMS BACnet Service


## Introduction

This service is a component of MyEMS to acquire data from BACnet devices

## Prerequisites
bacpypes

mysql.connector

Schedule

## Installation

Download and install MySQL Connector:
```
    $ cd ~/tools
    $ wget https://dev.mysql.com/get/Downloads/Connector-Python/mysql-connector-python-8.0.20.tar.gz
    $ tar xzf mysql-connector-python-8.0.20.tar.gz
    $ cd ~/tools/mysql-connector-python-8.0.20
    $ sudo python3 setup.py install
```

Download and install bacpypes library
```
    $ cd ~/tools
    $ git clone https://github.com/pypa/setuptools_scm.git
    $ git clone https://github.com/pytest-dev/pytest-runner.git
    $ git clone https://github.com/JoelBender/bacpypes.git
    $ cd ~/tools/setuptools_scm/
    $ sudo python3 setup.py install
    $ cd ~/tools/pytest-runner/
    $ sudo python3 setup.py install
    $ cd ~/tools/bacpypes
    $ sudo python3 setup.py install
    $ sudo ufw allow 47808
```

Download and install Schedule
```
$ cd ~/tools
$ git clone https://github.com/dbader/schedule.git
$ cd ~/tools/schedule
$ sudo python3 setup.py install
```

Install myems-bacnet service
```
    $ cd ~
    $ git clone https://github.com/MyEMS/myems.git
    $ cd myems
    $ git checkout master (or the latest release tag)
    $ sudo cp -R ~/myems/myems-bacnet /myems-bacnet
```
Edit the config
```
    $ sudo nano /myems-bacnet/config.py
```
Setup systemd service:
```bash
    $ sudo cp myems-bacnet.service /lib/systemd/system/
```
Enable the service:
```bash
    $ sudo systemctl enable myems-bacnet.service
```
Start the service:
```bash
    $ sudo systemctl start myems-bacnet.service
```
Monitor the service:
```bash
    $ sudo systemctl status myems-bacnet.service
```
View the log:
```bash
    $ cat /myems-bacnet.log
```

### Add Data Sources and Points in MyEMS Admin

Data source protocol: 
```
bacnet-ip
```

Data source connection example:
```
{"host": "192.168.0.3", "port": 47808}
```

Point address example:
```
{"object_id":3002786,"object_type":"analogValue","property_array_index":null,"property_name":"presentValue"}
```


## References

[1]. http://myems.io
  
[2]. http://bacnet.org
  
[3]. https://github.com/JoelBender/bacpypes
  

