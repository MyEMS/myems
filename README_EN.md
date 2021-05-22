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

![MyEMS Architecture Function View](/docs/images/architecture-function-view.png)

![MyEMS Architecture Site View](/docs/images/architecture-site-view.png)


## MyEMS Components (Community Edition)

This project is compose of  following components:

### MyEMS Database (SQL)

[Install database](./database/README.md)

### MyEMS API (Python)

[Install myems-api](./myems-api/README.md)

### MyEMS Admin UI (ReactJS)

[Install admin UI](./admin/README.md)

### MyEMS BACnet/IP Acquisition Service (Python)

[Install myems-bacnet](../myems-bacnet/README.md)

### MyEMS Modbus TCP Acquisition Service (Python)

[Install myems-modbus-tcp](./myems-modbus-tcp/README.md)

### MyEMS MQTT Data Forwarding Service (Python)

[Install myems-mqtt-publisher](./myems-mqtt-publisher/README.md)

### MyEMS Cleaning Service (Python)

[Install myems-cleaning](./myems-cleaning/README.md)

### MyEMS Normalization Service (Python)

[Install myems-normalization](./myems-normalization/README.md)

### MyEMS Aggregation Service (Python)

[Install myems-aggregation](./myems-aggregation/README.md)

### MyEMS Web UI (AngularJS)

[Install web UI](./web/README.md)


## Compare Editions

| Features                         | Community Edition | Enterprise Edition | Explanation    |
| :---                             |      :----:       |  :----:            | :----:         |
| Open Source                      | ✔️              | ❌       |                      |
| Pricing                          | Free            | Pay for Projects |               |
| Change Name and Logo             | ❌️             | ✔️        |                      |
| Modbus TCP                       | ✔️             | ✔️        |                      |
| Data Points Number               | Unlimited       | Unlimited | Limited only by hardware performance |
| Meters Number                    | Unlimited       | Unlimited | Limited only by hardware performance |
| Spaces Number                    | Unlimited       | Unlimited | Limited only by hardware performance |
| Equipments Number                | Unlimited       | Unlimited | Limited only by hardware performance |
| Tenants Number                   | Unlimited       | Unlimited | Limited only by hardware performance |
| Stores Number                    | Unlimited       | Unlimited | Limited only by hardware performance |
| Shopfloors Number                | Unlimited       | Unlimited | Limited only by hardware performance |
| Combined Equipments Number       | Unlimited       | Unlimited | Limited only by hardware performance |
| Docker                           | ❌             | ✔️        |                      |
| Kubernetes                       | ❌             | ✔️        |                      |
| MySQL                            | ✔️             | ✔️        |                      |
| MariaDB                          | ✔️             | ✔️        |                      |
| SingleStore                      | ❌             | ✔️        |                      |
| AWS Cloud                        | ✔️             | ✔️        |                      |
| AZure Cloud                      | ✔️             | ✔️        |                      |
| Alibaba Cloud                    | ✔️             | ✔️        |                      |
| Private Cloud                    | ✔️             | ✔️        |                      |
| Data Comparison                  | ✔️             | ✔️        | Year-on-Year, Month-on-Month, Free Comparison, None Comparison |
| Excel Exporter                   | ✔️             | ✔️        | Tables, Line Charts, Column Charts, Pie Charts |
| Meter/Energy Data                | ✔️             | ✔️        |                      |
| Meter/Cost Data                  | ✔️             | ✔️        |                      |
| Meter/Trend Data                 | ✔️             | ✔️        |                      |
| Meter/Realtime Data              | ✔️             | ✔️        |                      |
| Meter/Master Meter Submeters Balance | ✔️         | ✔️        |                      |
| Meter/Offline Meter Energy Data  | ✔️             | ✔️        |                      |
| Meter/Offline Meter Cost Data    | ✔️             | ✔️        |                      |
| Meter/Virtual Meter Energy Data  | ✔️             | ✔️        |                      |
| Meter/Virtual Meter Cost Data    | ✔️             | ✔️        |                      |
| Meter/Meter Tracking             | ✔️             | ✔️        |                      |
| Space/Energy Category Data       | ✔️             | ✔️        |                      |
| Space/Energy Item Data           | ✔️             | ✔️        |                      |
| Space/Cost Data                  | ✔️             | ✔️        |                      |
| Space/Output Data                | ✔️             | ✔️        |                      |
| Space/Income Data                | ✔️             | ✔️        |                      |
| Space/Efficiency Data            | ✔️             | ✔️        |                      |
| Space/Load Data                  | ✔️             | ✔️        |                      |
| Space/Statistics                 | ✔️             | ✔️        |                      |
| Space/Saving Data                | ❌             | ✔️        | Requires Energy consumption prediction component |
| Equipment/Energy Category Data   | ✔️             | ✔️        |                      |
| Equipment/Energy Item Data       | ✔️             | ✔️        |                      |
| Equipment/Cost Data              | ✔️             | ✔️        |                      |
| Equipment/Output Data            | ✔️             | ✔️        |                      |
| Equipment/Income Data            | ✔️             | ✔️        |                      |
| Equipment/Efficiency Data        | ✔️             | ✔️        |                      |
| Equipment/Load Data              | ✔️             | ✔️        |                      |
| Equipment/Statistics             | ✔️             | ✔️        |                      |
| Equipment/Saving Data            | ❌             | ✔️        | Requires Energy consumption prediction component |
| Equipment/Equipment Tracking     | ✔️             | ✔️        |                      |
| Tenant/Energy Category Data      | ✔️             | ✔️        |                      |
| Tenant/Energy Item Data          | ✔️             | ✔️        |                      |
| Tenant/Cost Data                 | ✔️             | ✔️        |                      |
| Tenant/Load Data                 | ✔️             | ✔️        |                      |
| Tenant/Statistics                | ✔️             | ✔️        |                      |
| Tenant/Saving Data               | ❌             | ✔️        | Requires Energy consumption prediction component |
| Tenant/Tenant Bill               | ✔️             | ✔️        |                      |
| Store/Energy Category Data       | ✔️             | ✔️        |                      |
| Store/Energy Item Data           | ✔️             | ✔️        |                      |
| Store/Cost Data                  | ✔️             | ✔️        |                      |
| Store/Load Data                  | ✔️             | ✔️        |                      |
| Store/Statistics                 | ✔️             | ✔️        |                      |
| Store/Saving Data                | ❌             | ✔️        | Requires Energy consumption prediction component |
| Shopfloor/Energy Category Data   | ✔️             | ✔️        |                      |
| Shopfloor/Energy Item Data       | ✔️             | ✔️        |                      |
| Shopfloor/Cost Data              | ✔️             | ✔️        |                      |
| Shopfloor/Load Data              | ✔️             | ✔️        |                      |
| Shopfloor/Statistics             | ✔️             | ✔️        |                      |
| Shopfloor/Saving Data            | ❌             | ✔️        | Requires Energy consumption prediction component |
| Combined Equipment/Energy Category Data | ✔️      | ✔️        |                      |
| Combined Equipment/Energy Item Data     | ✔️      | ✔️        |                      |
| Combined Equipment/Cost Data            | ✔️      | ✔️        |                      |
| Combined Equipment/Output Data          | ✔️      | ✔️        |                      |
| Combined Equipment/Income Data          | ✔️      | ✔️        |                      |
| Combined Equipment/Efficiency Data      | ✔️      | ✔️        |                      |
| Combined Equipment/Load Data            | ✔️      | ✔️        |                      |
| Combined Equipment/Statistics           | ✔️      | ✔️        |                      |
| Combined Equipment/Saving Data          | ❌      | ✔️        | Requires Energy consumption prediction component |
| Energy Dashboard                 | ✔️             | ✔️        |                      |
| Energy Flow Diagram              | ✔️             | ✔️        |                      |
| Distribution System              | ✔️             | ✔️        |                      |
| REST API                         | ✔️             | ✔️        |                      |
| Web UI                           | ✔️             | ✔️        |                      |
| Admin UI                         | ✔️             | ✔️        |                      |
| BACnet/IP                        | ❌             | ✔️        |                      |
| MQTT Subscriber                  | ❌             | ✔️        | Requires standard component license |
| MQTT Publisher                   | ❌️             | ✔️        | Requires standard component license |
| Modbus RTU                       | ❌             | ✔️        | Requires standard component license |
| OPC UA                           | ❌             | ✔️        | Requires standard component license |
| OPC DA                           | ❌             | ✔️        | Requires standard component license |
| Siemens S7                       | ❌             | ✔️        | Requires standard component license |
| IEC 104                          | ❌             | ✔️        | Requires standard component license |
| Johnson Controls Metasys API     | ❌             | ✔️        | Requires standard component license |
| Honeywell EBI                    | ❌             | ✔️        |                      |
| SIEMENS Desigo CC                | ❌             | ✔️        | Requires standard component license |
| QWeather API                     | ❌             | ✔️        | Requires standard component license |
| FDD Rule Engine                  | ❌             | ✔️        | Requires standard component license or custom development |
| Advanced Reporting Engine        | ❌             | ✔️        | Requires standard component license or custom development |
| Prognose des Energieverbrauchs   | ❌             | ✔️        | Requires standard component license or custom development |
| Graphics Drawing Tool            | ❌             | ✔️        |                      |
| Equipments Remote Control        | ❌             | ✔️        | Requires standard component license or custom development |
| BACnet Server                    | ❌             | ✔️        |                      |
| Modbus TCP Server(Slave)         | ❌             | ✔️        |                      |
| OPC UA Server                    | ❌             | ✔️        |                      |
| iOS APP                          | ❌             | ✔️        | Requires standard component license or custom development |
| Android APP                      | ❌             | ✔️        | Requires standard component license or custom development |
| WeChat Mini Program              | ❌             | ✔️        | Requires standard component license or custom development |
| Alipay Mini Program              | ❌             | ✔️        | Requires standard component license or custom development |
| IPC Hardware Gateway (Data Acquisition and Remote Control）| ❌ | ✔️ | MyEMS certified industrial computer hardware |
| LoRa Radio Module (Data Acquisition and Remote Control）| ❌ | ✔️ | MyEMS certified LoRa hardware device |
| Protocol for Uploading to Provincial Platform of On-line monitoring system for Key Energy-Consuming Unit | ❌ | ✔️ | Requires standard component license or custom development |
| 3rd Party Systems Integration Service | ❌        | ✔️        | Custom development |
| Online software training         | ❌             | ✔️        |                      |
| Face to face software training   | ❌             | ✔️        |                      |
| Online Community Customer Support| ✔️             | ✔️        |                      |
| Email Customer Support           | ❌             | ✔️        |                      |
| Telephone Customer Support       | ❌             | ✔️        |                      |
| WeChat Customer Support          | ❌             | ✔️        |                      |
| Remote Desktop Customer Support  | ❌             | ✔️        |                      |
| Onsite Customer Support          | ❌             | ✔️        |                      |
| Bidding Support Service          | ❌             | ✔️        |                      |
| Customize Support Service        | ❌             | ✔️        |                      |

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

