## MyEMS MQTT Publisher Service

### Introduction
This service is a component of MyEMS to publish data to MQTT broker.

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/eb783b8f80d94fa583dd1ebe953f0e97)](https://app.codacy.com/gh/myems/myems-mqtt-publisher?utm_source=github.com&utm_medium=referral&utm_content=myems/myems-mqtt-publisher&utm_campaign=Badge_Grade)
[![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/myems/myems-mqtt-publisher/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/myems/myems-mqtt-publisher/?branch=master)
[![Maintainability](https://api.codeclimate.com/v1/badges/f2cb7c3fb4a7499e9d1d/maintainability)](https://codeclimate.com/github/myems/myems-mqtt-publisher/maintainability)
[![Total alerts](https://img.shields.io/lgtm/alerts/g/myems/myems-mqtt-publisher.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/myems/myems-mqtt-publisher/alerts/)


### Prerequisites
simplejson

paho-mqtt

mysql.connector

### Installation

Download and Install simplejson
```
    $ cd ~/tools
    $ git clone https://github.com/simplejson/simplejson.git
    $ cd simplejson
    $ sudo python3 setup.py install 
```

Download and install MySQL Connector:
```
    $ cd ~/tools
    $ wget https://dev.mysql.com/get/Downloads/Connector-Python/mysql-connector-python-8.0.20.tar.gz
    $ tar xzf mysql-connector-python-8.0.20.tar.gz
    $ cd ~/tools/mysql-connector-python-8.0.20
    $ sudo python3 setup.py install
```

Download and install paho-mqtt:
```
    $ cd ~/tools
    $ git clone https://github.com/eclipse/paho.mqtt.python.git
    $ cd ~/tools/paho.mqtt.python
    $ sudo python3 setup.py install
```

Install myems-mqtt-publisher service
```
    $ cd ~
    $ git clone https://github.com/MyEMS/myems.git
    $ cd myems
    $ sudo git checkout master (or the latest release tag)
    $ sudo cp -R ~/myems/myems-mqtt-publisher /myems-mqtt-publisher
```
    Eidt the config
```
    $ sudo nano /myems-mqtt-publisher/config.py
```
    Setup systemd service:
```
    $ sudo cp /myems-mqtt-publisher/myems-mqtt-publisher.service /lib/systemd/system/
    $ sudo systemctl enable myems-mqtt-publisher.service
    $ sudo systemctl start myems-mqtt-publisher.service
```

### Topic
topic_prefix in config and point_id

Example:
```
'myems/point/3'
```

### Payload
data_source_id, the Data Source ID.

point_id, the Point ID.

object_type, the type of data, is one of 'ANALOG_VALUE'(decimal(18, 3)) , 'ENERGY_VALUE'(decimal(18, 3)) and 'DIGITAL_VALUE'(int(11)).

utc_date_time, the date time in utc when data was acquired. The full format looks like 'YYYY-MM-DDTHH:MM:SS'.

value, the data value in Decimal or Integer.

Example:
```
{"data_source_id": 1, "point_id": 3, "object_type": 'ANALOG_VALUE', "utc_date_time": "2020-09-28T03:23:06", "value": Decimal('591960276.000')}
```

### References
  [1]. http://myems.io
  
  [2]. https://www.eclipse.org/paho/clients/python/
  
  [3]. https://simplejson.readthedocs.io/

