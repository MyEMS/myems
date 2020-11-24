# MyEMS

 [中文](#MyEMS-介绍) | [EN](#MyEMS-Introduction) | [DE](#MyEMS-Einführung)
 
 [![Documentation Status](https://readthedocs.org/projects/myems/badge/?version=latest)](https://myems.readthedocs.io/en/latest/?badge=latest)
      

## MyEMS 介绍

MyEMS是行业领先的开源能源管理系统，利用云计算、物联网、大数据、人工智能等信息化技术构建而成。MyEMS可用于构建统一规范、功能强大的综合能源管理服务平台。MyEMS由资深专业团队开发维护，系统代码基于MIT开源软件许可协议发布。

## MyEMS架构
![MyEMS Architecture](/.readme/architecture.png)

## MyEMS组件(社区版 )

MyEMS项目由下列组件构成:
![MyEMS Conponents](/.readme/myem-conponets.svg)

### MyEMS Web APP

参考仓库 [myems-web](https://github.com/myems/myems-web.git) 获取更多信息。

### MyEMS 管理面板

参考仓库  [myems-admin](https://github.com/myems/myems-admin.git) 获取更多信息。

### MyEMS 数据库

参考仓库  [myems-database](https://github.com/myems/myems-database.git) 获取更多信息。

### MyEMS 数据清洗服务

参考仓库  [myems-cleaning](https://github.com/myems/myems-cleaning.git) 获取更多信息。

### MyEMS 数据规范化服务

参考仓库  [myems-normalization](https://github.com/myems/myems-normalization.git) 获取更多信息。

### MyEMS 数据汇总服务

参考仓库  [myems-aggregation](https://github.com/myems/myems-aggregation.git) 获取更多信息。

### MyEMS 数据接口API

参考仓库  [myems-api](https://github.com/myems/myems-api.git) 获取更多信息。

### MyEMS MQTT 数据发布服务 (从MyEMS转发到第三方)

参考仓库  [myems-mqtt-publisher](https://github.com/myems/myems-mqtt-publisher.git) 获取更多信息。

### MyEMS BACnet/IP 数据采集服务

参考仓库  [myems-bacnet](https://github.com/myems/myems-bacnet.git) 获取更多信息。

### MyEMS Modbus TCP 数据采集服务

参考仓库  [myems-modbus-tcp](https://github.com/myems/myems-modbus-tcp.git) 获取更多信息。

## 功能版本对比
| 功能                              |社区版(MyEMS)   |企业版(AlbertEOS)|
| :---                             |      :----:   |  :----: |
| 开源                              | ✔️             | ❌      |
| 定价模式                          | 免费           | 按项目付费 |
| 更换品牌名称与标志LOGO              | ✔️             | ✔️        |
| Modbus TCP 协议                   | ✔️             | ✔️        |
| BACnet/IP 协议                    | ✔️             | ✔️        |
| MQTT 协议发布                      | ✔️             | ✔️        |
| 数据点数                           | 无限制         |无限制     |
| 计量表数                           | 无限制         |无限制     |
| 设备数                             | 无限制         |无限制     |
| 用能单位数                         | 无限制         |无限制     |
| Docker 容器部署                    | ✔️             | ✔️        |
| Kubernetes部署                    | ✔️             | ✔️        |
| MySQL                            | ✔️             | ✔️        |
| MariaDB                          | ✔️             | ✔️        |
| MemSQL                           | ✔️             | ✔️        |
| AWS 云部署                        | ✔️             | ✔️        |
| AZure 云部署                      | ✔️             | ✔️        |
| 阿里云部署                         | ✔️             | ✔️        |
| 私有云部署                         | ✔️             | ✔️        |
| 空间能源消耗分析                    | ✔️             | ✔️        |
| 空间能源费用分析                    | ✔️             | ✔️        |
| 空间能源产出分析                    | ✔️             | ✔️        |
| 空间能效分析                       | ✔️             | ✔️        |
| 空间对比分析                       | ✔️             | ✔️        |
| 空间能耗排名                       | ✔️             | ✔️        |
| 能耗概览页                         | ✔️             | ✔️        |
| 能流图分析                         | ✔️             | ✔️        |
| 配电系统分析                       | ✔️             | ✔️        |
| 设备能效分析                       | ✔️             | ✔️        |
| 租户能耗分析                       | ✔️             | ✔️        |
| 店铺能耗分析                       | ✔️             | ✔️        |
| 车间能耗分析                       | ✔️             | ✔️        |
| REST API                         | ✔️             | ✔️        |
| Web APP                          | ✔️             | ✔️        |
| MQTT 协议 订阅                    | ❌            | ✔️        |
| Modbus RTU 协议                   | ❌            | ✔️        |
| OPC UA 协议                       | ❌            | ✔️        |
| OPC DA 协议                       | ❌            | ✔️        |
| Siemens S7 协议                   | ❌            | ✔️        |
| IEC 104 协议                      | ❌            | ✔️        |
| Johnson Controls Metasys         | ✔️             | ✔️        |
| Honeywell EBI                    | ✔️             | ✔️        |
| SIEMENS Desigo CC                | ❌            | ✔️        |
| FDD 故障诊断规则引擎                | ❌            | ✔️        |
| 高级报表引擎                       | ❌            | ✔️        |
| 组态图形绘制工具                    | ❌            | ✔️        |
| 设备远程控制                       | ❌            | ✔️        |
| BACnet Server                    | ❌            | ✔️        |
| iOS APP                          | ❌            | ✔️        |
| Android APP                      | ❌            | ✔️        |
| 无风扇工控机硬件网关(数据采集和远程控制）| ❌           | ✔️        |
| LoRa无线数传电台模块(数据采集和远程控制）| ❌          | ✔️        |
| 重点用能单位能耗在线监测系统上传省级平台通信协议| ❌     | ✔️        |
| 第三方系统集成服务                  | ❌            | ✔️        |
| 在线社区技术支持                    | ✔️             | ✔️        |
| 邮件技术支持                       | ✔️             | ✔️        |
| 电话技术支持服务                   | ❌            | ✔️        |
| 微信技术支持服务                   | ❌            | ✔️        |
| 远程桌面技术支持服务                | ❌            | ✔️        |
| 现场技术支持服务                   | ❌            | ✔️        |
| 投标技术支持服务                   | ❌            | ✔️        |
| 二次开发技术支持服务                | ❌            | ✔️        |


## MyEMS Introduction
 MyEMS is an industry leading open source Energy Management System that is built on cloud computing, IOT, Big Data and AI technologies. MyEMS can be used for a standard and powerful integrated energy management service platform.
MyEMS is being developed and maintained by an experienced development team, and the system's source code is published under MIT license.

## MyEMS Architecture
![MyEMS Architecture](/.readme/architecture.png)

## MyEMS Components (Standard Edition)
![MyEMS Conponents](/.readme/myem-conponets.svg)

This project is compose of  following components:

### MyEMS Web APP

See the repository [myems-web](https://github.com/myems/myems-web.git) for more information.

### MyEMS Admin Panel

See the repository [myems-admin](https://github.com/myems/myems-admin.git) for more information.

### MyEMS Database

See the repository [myems-database](https://github.com/myems/myems-database.git) for more information.

### MyEMS Cleaning Service

See the repository [myems-cleaning](https://github.com/myems/myems-cleaning.git) for more information.

### MyEMS Normalization Service

See the repository [myems-normalization](https://github.com/myems/myems-normalization.git) for more information.

### MyEMS Aggregation Service

See the repository [myems-aggregation](https://github.com/myems/myems-aggregation.git) for more information.

### MyEMS API

See the repository [myems-api](https://github.com/myems/myems-api.git) for more information.

### MyEMS MQTT Data Publisher Service (transmit data from MyEMS to 3rd Party)

See the repository [myems-mqtt-publisher](https://github.com/myems/myems-mqtt-publisher.git) for more information.

### MyEMS BACnet/IP Acquisition Service

See the repository [myems-bacnet](https://github.com/myems/myems-bacnet.git) for more information.

### MyEMS Modbus TCP Acquisition Service

See the repository [myems-modbus-tcp](https://github.com/myems/myems-modbus-tcp.git) for more information.

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
| MemSQL                           | ✔️             | ✔️        |
| AWS Cloud                        | ✔️             | ✔️        |
| AZure Cloud                      | ✔️             | ✔️        |
| Alibaba Cloud                    | ✔️             | ✔️        |
| Private Cloud                    | ✔️             | ✔️        |
| Space Energy Consumption Reports | ✔️             | ✔️        |
| Space Energy Billing Reports     | ✔️             | ✔️        |
| Space Efficiency Reports         | ✔️             | ✔️        |
| Space Energy Output Reports      | ✔️             | ✔️        |
| Space Comparison Reports         | ✔️             | ✔️        |
| Space Energy Ranking Reports     | ✔️             | ✔️        |
| Energy Dashboard                 | ✔️             | ✔️        |
| Energy Flow Diagram              | ✔️             | ✔️        |
| Distribution System              | ✔️             | ✔️        |
| Equipment Efficiency Reports     | ✔️             | ✔️        |
| Tenant Energy Consumption Reports| ✔️             | ✔️        |
| Sotre Energy Consumption Reports | ✔️             | ✔️        |
| Shopfloor Energy Consumption Reports | ✔️         | ✔️        |
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
| Fanless IPC Hardware Gateways (Data Acquisition and Remote Control）| ❌            | ✔️        |
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

## MyEMS-Einführung
MyEMS ist ein branchenführendes Open-Source-Energiemanagementsystem, das auf Cloud-Computing-, IOT-, Big Data- und AI-Technologien basiert. MyEMS kann für eine standardmäßige und leistungsstarke integrierte Energiemanagement-Serviceplattform verwendet werden.
MyEMS wird von einem erfahrenen Entwicklungsteam entwickelt und gewartet, und der Quellcode des Systems wird unter MIT-Lizenz veröffentlicht.

## MyEMS Architektur
![MyEMS Architecture](/.readme/architecture.png)

## MyEMS Komponenten (Gemeinschaftsausgabe)
![MyEMS Conponents](/.readme/myem-conponets.svg)

Dieses Projekt besteht aus folgenden Komponenten:

### MyEMS Web APP

Weitere Informationen finden Sie im Repository [myems-web](https://github.com/myems/myems-web.git).

### MyEMS Admin Panel

Weitere Informationen finden Sie im Repository [myems-admin](https://github.com/myems/myems-admin.git).

### MyEMS Database

Weitere Informationen finden Sie im Repository [myems-database](https://github.com/myems/myems-database.git).

### MyEMS Cleaning Service

Weitere Informationen finden Sie im Repository [myems-cleaning](https://github.com/myems/myems-cleaning.git).

### MyEMS Normalization Service

Weitere Informationen finden Sie im Repository [myems-normalization](https://github.com/myems/myems-normalization.git).

### MyEMS Aggregation Service

Weitere Informationen finden Sie im Repository [myems-aggregation](https://github.com/myems/myems-aggregation.git).

### MyEMS API

Weitere Informationen finden Sie im Repository [myems-api](https://github.com/myems/myems-api.git).

### MyEMS MQTT Data Publisher Service (transmit data from MyEMS to 3rd Party)

Weitere Informationen finden Sie im Repository [myems-mqtt-publisher](https://github.com/myems/myems-mqtt-publisher.git).

### MyEMS BACnet/IP Acquisition Service

Weitere Informationen finden Sie im Repository [myems-bacnet](https://github.com/myems/myems-bacnet.git).

### MyEMS Modbus TCP Acquisition Service

Weitere Informationen finden Sie im Repository [myems-modbus-tcp](https://github.com/myems/myems-modbus-tcp.git).

## Editionen vergleichen

| Eigenschaften                    |Gemeinschaftsausgabe (MyEMS) |Enterprise Edition (AlbertEOS)|
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
| MemSQL                           | ✔️             | ✔️        |
| AWS Cloud                        | ✔️             | ✔️        |
| AZure Cloud                      | ✔️             | ✔️        |
| Alibaba Cloud                    | ✔️             | ✔️        |
| Private Cloud                    | ✔️             | ✔️        |
| Space Energy Consumption Reports | ✔️             | ✔️        |
| Space Energy Billing Reports     | ✔️             | ✔️        |
| Space Efficiency Reports         | ✔️             | ✔️        |
| Space Energy Output Reports      | ✔️             | ✔️        |
| Space Comparison Reports         | ✔️             | ✔️        |
| Space Energy Ranking Reports     | ✔️             | ✔️        |
| Energy Dashboard                 | ✔️             | ✔️        |
| Energy Flow Diagram              | ✔️             | ✔️        |
| Distribution System              | ✔️             | ✔️        |
| Equipment Efficiency Reports     | ✔️             | ✔️        |
| Tenant Energy Consumption Reports| ✔️             | ✔️        |
| Sotre Energy Consumption Reports | ✔️             | ✔️        |
| Shopfloor Energy Consumption Reports | ✔️         | ✔️        |
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
| Fanless IPC Hardware Gateways (Data Acquisition and Remote Control）| ❌            | ✔️        |
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

