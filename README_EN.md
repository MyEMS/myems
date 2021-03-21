# MyEMS

 [中文](./README.md) | [EN](./README_EN.md) | [DE](./README_DE.md)

 [![Documentation Status](https://readthedocs.org/projects/myems/badge/?version=latest)](https://myems.readthedocs.io/en/latest/?badge=latest)
 [![Maintainability](https://api.codeclimate.com/v1/badges/e01a2ca1e833d66040d0/maintainability)](https://codeclimate.com/github/MyEMS/myems/maintainability)
 [![Test Coverage](https://api.codeclimate.com/v1/badges/e01a2ca1e833d66040d0/test_coverage)](https://codeclimate.com/github/MyEMS/myems/test_coverage)
 [![Total alerts](https://img.shields.io/lgtm/alerts/g/MyEMS/myems.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/MyEMS/myems/alerts/)
 [![Language grade: Python](https://img.shields.io/lgtm/grade/python/g/MyEMS/myems.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/MyEMS/myems/context:python)
 [![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/MyEMS/myems.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/MyEMS/myems/context:javascript) 
 [![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/MyEMS/myems/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/MyEMS/myems/?branch=master)
 [![Build Status](https://scrutinizer-ci.com/g/MyEMS/myems/badges/build.png?b=master)](https://scrutinizer-ci.com/g/MyEMS/myems/build-status/master)
 [![Codacy Badge](https://app.codacy.com/project/badge/Grade/b2cd6049727240e2aaeb8fc7b4086166)](https://www.codacy.com/gh/MyEMS/myems/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=MyEMS/myems&amp;utm_campaign=Badge_Grade)

## MyEMS Introduction
 MyEMS is an industry leading open source Energy Management System that is built on cloud computing, IOT, Big Data and AI technologies. MyEMS can be used for a standard and powerful integrated energy management service platform.
MyEMS is being developed and maintained by an experienced development team, and the system's source code is published under MIT license.

## MyEMS Architecture
![MyEMS Architecture](/docs/images/architecture.png)

## MyEMS Components (Community Edition)

This project is compose of  following components:

### MyEMS Web UI
AngularJS

See the repository [web](./web/README.md) for more information.

### MyEMS Admin UI
ReactJS

See [admin](./admin/README.md) for more information.

### MyEMS Database
SQL

See [database](./database/README.md) for more information.

### MyEMS Cleaning Service
Python

See [myems-cleaning](./myems-cleaning/README.md) for more information.

### MyEMS Normalization Service
Python

See [myems-normalization](./myems-normalization/README.md) for more information.

### MyEMS Aggregation Service
Python

See [myems-aggregation](./myems-aggregation/README.md) for more information.

### MyEMS API
Python

See the repository [myems-api](./myems-api/README.md) for more information.

### MyEMS MQTT Data Publisher Service (transmit data from MyEMS to 3rd Party)
Python

See [myems-mqtt-publisher](./myems-mqtt-publisher/README.md) for more information.

### MyEMS BACnet/IP Acquisition Service
Python

See [myems-bacnet](./myems-bacnet/README.md) for more information.

### MyEMS Modbus TCP Acquisition Service
Python

See [myems-modbus-tcp](./myems-modbus-tcp/README.md) for more information.


## Compare Editions

| Features                         |Communit Edition (MyEMS) |Enterprise Edition (AlbertEOS)|
| :---                             |      :----:   |  :----: |
| Open Source                      | ✔️             | ❌      |
| Pricing                          | Free          | Pay for Projects |
| Change Name and Logo             | ✔️             | ✔️        |
| Modbus TCP                       | ✔️             | ✔️        |
| BACnet/IP                        | ✔️             | ✔️        |
| MQTT Publisher                   | ✔️             | ✔️        |
| Data Points Number               | Unlimited     |Unlimited |
| Meters Number                    | Unlimited     |Unlimited |
| Equipments Number                | Unlimited     |Unlimited |
| Spaces Number                    | Unlimited     |Unlimited |
| Docker                           | ✔️             | ✔️        |
| Kubernetes                       | ✔️             | ✔️        |
| MySQL                            | ✔️             | ✔️        |
| MariaDB                          | ✔️             | ✔️        |
| SingleStore                      | ✔️             | ✔️        |
| AWS Cloud                        | ✔️             | ✔️        |
| AZure Cloud                      | ✔️             | ✔️        |
| Alibaba Cloud                    | ✔️             | ✔️        |
| Private Cloud                    | ✔️             | ✔️        |
| Data Comparison（Year-on-Year、Month-on-Month、Any-on-Any）| ✔️  | ✔️        |
| Export result to Excel           | ✔️             | ✔️        |
| Space/Energy Category Data       | ✔️             | ✔️        |
| Space/Energy Item Data           | ✔️             | ✔️        |
| Space/Cost Data                  | ✔️             | ✔️        |
| Space/Output Data                | ✔️             | ✔️        |
| Space/Income Data                | ✔️             | ✔️        |
| Space/Efficiency Data            | ✔️             | ✔️        |
| Space/Load Data                  | ✔️             | ✔️        |
| Space/Statistics                 | ✔️             | ✔️        |
| Space/Saving Data                | ❌            | ✔️        |
| Equipment/Energy Category Data   | ✔️             | ✔️        |
| Equipment/Energy Item Data       | ✔️             | ✔️        |
| Equipment/Cost Data              | ✔️             | ✔️        |
| Equipment/Output Data            | ✔️             | ✔️        |
| Equipment/Income Data            | ✔️             | ✔️        |
| Equipment/Efficiency Data        | ✔️             | ✔️        |
| Equipment/Load Data              | ✔️             | ✔️        |
| Equipment/Statistics             | ✔️             | ✔️        |
| Equipment/Saving Data            | ❌            | ✔️        |
| Equipment/Equipment Tracking     | ✔️             | ✔️        |
| Meter/Energy Data                | ✔️             | ✔️        |
| Meter/Cost Data                  | ✔️             | ✔️        |
| Meter/Trend Data                 | ✔️             | ✔️        |
| Meter/Realtime Data              | ✔️             | ✔️        |
| Meter/Master Meter Submeters Balance | ✔️         | ✔️        |
| Meter/Offline Meter Energy Data  | ✔️             | ✔️        |
| Meter/Offline Meter Cost Data    | ✔️             | ✔️        |
| Meter/Virtual Meter Energy Data  | ✔️             | ✔️        |
| Meter/Virtual Meter Cost Data    | ✔️             | ✔️        |
| Meter/Meter Tracking             | ✔️             | ✔️        |
| Tenant/Energy Category Data      | ✔️             | ✔️        |
| Tenant/Energy Item Data          | ✔️             | ✔️        |
| Tenant/Cost Data                 | ✔️             | ✔️        |
| Tenant/Load Data                 | ✔️             | ✔️        |
| Tenant/Statistics                | ✔️             | ✔️        |
| Tenant/Saving Data               | ❌            | ✔️        |
| Tenant/Tenant Bill               | ✔️             | ✔️        |
| Store/Energy Category Data       | ✔️             | ✔️        |
| Store/Energy Item Data           | ✔️             | ✔️        |
| Store/Cost Data                  | ✔️             | ✔️        |
| Store/Load Data                  | ✔️             | ✔️        |
| Store/Statistics                 | ✔️             | ✔️        |
| Store/Saving Data                | ❌            | ✔️        |
| Shopfloor/Energy Category Data   | ✔️             | ✔️        |
| Shopfloor/Energy Item Data       | ✔️             | ✔️        |
| Shopfloor/Cost Data              | ✔️             | ✔️        |
| Shopfloor/Load Data              | ✔️             | ✔️        |
| Shopfloor/Statistics             | ✔️             | ✔️        |
| Shopfloor/Saving Data            | ❌            | ✔️        |
| Combined Equipment/Energy Category Data | ✔️      | ✔️        |
| Combined Equipment/Energy Item Data     | ✔️      | ✔️        |
| Combined Equipment/Cost Data            | ✔️      | ✔️        |
| Combined Equipment/Output Data          | ✔️      | ✔️        |
| Combined Equipment/Income Data          | ✔️      | ✔️        |
| Combined Equipment/Efficiency Data      | ✔️      | ✔️        |
| Combined Equipment/Load Data            | ✔️      | ✔️        |
| Combined Equipment/Statistics           | ✔️      | ✔️        |
| Combined Equipment/Saving Data          | ❌     | ✔️        |
| Energy Dashboard                 | ✔️             | ✔️        |
| Energy Flow Diagram              | ✔️             | ✔️        |
| Distribution System              | ✔️             | ✔️        |
| REST API                         | ✔️             | ✔️        |
| Web UI                           | ✔️             | ✔️        |
| Admin UI                         | ✔️             | ✔️        |
| MQTT Subscriber                  | ❌            | ✔️        |
| Modbus RTU                       | ❌            | ✔️        |
| OPC UA                           | ❌            | ✔️        |
| OPC DA                           | ❌            | ✔️        |
| Siemens S7                       | ❌            | ✔️        |
| IEC 104                          | ❌            | ✔️        |
| Johnson Controls Metasys         | ✔️             | ✔️        |
| Honeywell EBI                    | ✔️             | ✔️        |
| SIEMENS Desigo CC                | ❌            | ✔️        |
| QWeather API                     | ❌            | ✔️        |
| FDD Rule Engine                  | ❌            | ✔️        |
| Advanced Reporting Engine        | ❌            | ✔️        |
| Graphics Drawing Tool            | ❌            | ✔️        |
| Equipments Remote Control        | ❌            | ✔️        |
| BACnet Server                    | ❌            | ✔️        |
| Modbus TCP Server(Slave)         | ❌            | ✔️        |
| OPC UA Server                    | ❌            | ✔️        |
| iOS APP                          | ❌            | ✔️        |
| Android APP                      | ❌            | ✔️        |
| WeChat Mini Program              | ❌            | ✔️        |
| Alipay Mini Program              | ❌            | ✔️        |
| IPC Hardware Gateway (Data Acquisition and Remote Control）| ❌            | ✔️        |
| LoRa Radio Module (Data Acquisition and Remote Control）| ❌          | ✔️        |
| Protocol for Uploading to Provincial Platform of On-line monitoring system for Key Energy-Consuming Unit| ❌     | ✔️        |
| 3rd Party Systems Integration Service | ❌            | ✔️        |
| Online Community Customer Support| ✔️             | ✔️        |
| Email Customer Support           | ✔️             | ✔️        |
| Telephone Customer Support       | ❌            | ✔️        |
| WeChat Customer Support          | ❌            | ✔️        |
| Remote Desktop Customer Support  | ❌            | ✔️        |
| Onsite Customer Support          | ❌            | ✔️        |
| Bidding Support Service          | ❌            | ✔️        |
| Customize Support Service        | ❌            | ✔️        |

## MyEMS Screenshot
![MyEMS Space EnergyCategory1](/docs/images/myems-space-energycategory1.gif)
![MyEMS Space EnergyCategory2](/docs/images/myems-space-energycategory2.gif)
![MyEMS Space EnergyCategory3](/docs/images/myems-space-energycategory3.gif)
![MyEMS Large Screen Dashboard](/docs/images/myems-large-screen-dashboard.gif)


## MyEMS Mirrors

[1]. http://github.com/MyEMS/myems

[2]. http://gitee.com/myems/myems

[3]. http://bitbucket.org/myems/myems

[4]. https://gitlab.com/myems/myems

