# MyEMS

 [中文](./README.md) | [EN](./README_EN.md) | [DE](./README_DE.md)

 [![Documentation Status](https://readthedocs.org/projects/myems/badge/?version=latest)](https://myems.readthedocs.io/en/latest/?badge=latest)

## MyEMS-Einführung
MyEMS ist ein branchenführendes Open-Source-Energiemanagementsystem, das auf Cloud-Computing-, IOT-, Big Data- und AI-Technologien basiert. MyEMS kann für eine standardmäßige und leistungsstarke integrierte Energiemanagement-Serviceplattform verwendet werden.
MyEMS wird von einem erfahrenen Entwicklungsteam entwickelt und gewartet, und der Quellcode des Systems wird unter MIT-Lizenz veröffentlicht.

## MyEMS Architektur
![MyEMS Architecture](/docs/images/architecture.png)

## MyEMS Komponenten (GCommunity Edition)

Dieses Projekt besteht aus folgenden Komponenten:

### MyEMS Web APP

Weitere Informationen finden Sie [web](./web/README.md).

### MyEMS Admin Panel

Weitere Informationen finden Sie im [admin](./admin/README.md).

### MyEMS Database

Weitere Informationen finden Sie im [database](./database/README.md).

### MyEMS Cleaning Service

Weitere Informationen finden Sie im [myems-cleaning](./myems-cleaning/README.md).

### MyEMS Normalization Service

Weitere Informationen finden Sie im [myems-normalization](./myems-normalization/README.md).

### MyEMS Aggregation Service

Weitere Informationen finden Sie im [myems-aggregation](./myems-aggregation/README.md).

### MyEMS API

Weitere Informationen finden Sie im Repository [myems-api](https://github.com/MyEMS/myems-api.git).

### MyEMS MQTT Data Publisher Service (transmit data from MyEMS to 3rd Party)

Weitere Informationen finden Sie im [myems-mqtt-publisher](./myems-mqtt-publisher/README.md).

### MyEMS BACnet/IP Acquisition Service

Weitere Informationen finden Sie im [myems-bacnet](./myems-bacnet/README.md).

### MyEMS Modbus TCP Acquisition Service

Weitere Informationen finden Sie im [myems-modbus-tcp](./myems-modbus-tcp/README.md).

## MyEMS Bildschirmfoto
![MyEMS Bildschirmfoto](/docs/images/screenshot-2020.12.01-16_53_12.png)

## Editionen vergleichen

| Eigenschaften                    |Community Edition (MyEMS) |Enterprise Edition (AlbertEOS)|
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
| Data Comparison（Year-on-Year、Month-on-Month、Any-on-Any） | ✔️             | ✔️        |
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
| Web APP                          | ✔️             | ✔️        |
| MQTT Subscriber                  | ❌            | ✔️        |
| Modbus RTU                       | ❌            | ✔️        |
| OPC UA                           | ❌            | ✔️        |
| OPC DA                           | ❌            | ✔️        |
| Siemens S7                       | ❌            | ✔️        |
| IEC 104                          | ❌            | ✔️        |
| Johnson Controls Metasys         | ✔️             | ✔️        |
| Honeywell EBI                    | ✔️             | ✔️        |
| SIEMENS Desigo CC                | ❌            | ✔️        |
| FDD Rule Engine                  | ❌            | ✔️        |
| Advanced Reporting Engine        | ❌            | ✔️        |
| Graphics Drwaing Tool            | ❌            | ✔️        |
| Equipments Remote Control        | ❌            | ✔️        |
| BACnet Server                    | ❌            | ✔️        |
| iOS APP                          | ❌            | ✔️        |
| Android APP                      | ❌            | ✔️        |
| IPC Hardware Gateway (Data Acquisition and Remote Control）| ❌            | ✔️        |
| LoRa Radio Module (Data Acquisition and Remote Control）| ❌          | ✔️        |
| Protocol for Uploading to Provincial Platform of On-line monitoring system for Key Energy-Consuming Unit| ❌     | ✔️        |
| 3rd Party Systems Integration    | ❌            | ✔️        |
| Online Community Customer Support| ✔️             | ✔️        |
| Email Customer Support           | ✔️             | ✔️        |
| Telephone Customer Support       | ❌            | ✔️        |
| WeChat Customer Support          | ❌            | ✔️        |
| Remote Desktop Customer Support  | ❌            | ✔️        |
| Onsite Customer Support          | ❌            | ✔️        |
| Bidding Support Service          | ❌            | ✔️        |
| Customize Support Service        | ❌            | ✔️        |
