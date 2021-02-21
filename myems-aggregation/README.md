## MyEMS Aggregation Service 数据汇总服务



### Introduction

This service is a component of MyEMS and it aggregates normalized data up to multiple dimensions.

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/cb75cee835ba46118115e088f8be6d87)](https://app.codacy.com/gh/myems/myems-aggregation?utm_source=github.com&utm_medium=referral&utm_content=myems/myems-aggregation&utm_campaign=Badge_Grade)
[![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/myems/myems-aggregation/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/myems/myems-aggregation/?branch=master)
[![Maintainability](https://api.codeclimate.com/v1/badges/ecff11174fd74975946c/maintainability)](https://codeclimate.com/github/myems/myems-aggregation/maintainability)
[![Total alerts](https://img.shields.io/lgtm/alerts/g/myems/myems-bacnet.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/myems/myems-bacnet/alerts/)

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
    Edit config.py for your project
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

### References

[1]. https://myems.io

[2]. https://dev.mysql.com/doc/connector-python/en/
