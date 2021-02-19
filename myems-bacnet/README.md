# MyEMS BACnet Service


## Introduction

This service is a component of MyEMS to acquire data from BACnet devices

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/42a86789a9a0425492a8890b5ae43dd8)](https://app.codacy.com/gh/myems/myems-bacnet?utm_source=github.com&utm_medium=referral&utm_content=myems/myems-bacnet&utm_campaign=Badge_Grade)
[![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/myems/myems-bacnet/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/myems/myems-bacnet/?branch=master)
[![Maintainability](https://api.codeclimate.com/v1/badges/90a12776a218fb5ff465/maintainability)](https://codeclimate.com/github/myems/myems-bacnet/maintainability)
[![Total alerts](https://img.shields.io/lgtm/alerts/g/myems/myems-bacnet.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/myems/myems-bacnet/alerts/)

## Prerequisites
bacpypes

mysql.connector



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

Install myems-bacnet service
```
    $ cd ~
    $ git clone https://github.com/myems/myems.git
    $ cd myems
    $ git checkout master (or the latest release tag)
    $ sudo cp -R ~/myems/myems-bacnet /myems-bacnet
```
    Eidt the config config
```
    $ sudo nano /myems-bacnet/config.py
```
    Setup systemd service:
```
    $ sudo cp /myems-bacnet/myems-bacnet.service /lib/systemd/system/
    $ sudo systemctl enable myems-bacnet.service
    $ sudo systemctl start myems-bacnet.service
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
  

