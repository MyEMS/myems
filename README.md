# MyEMS

 [中文](#MyEMS-介绍) | [EN](#MyEMS-Introduction)

## MyEMS 介绍

MyEMS是领先的开源能源管理系统，利用云计算、物联网、大数据、人工智能等信息化技术构建而成。MyEMS可用于构建统一规范、功能强大的综合能源管理服务平台。MyEMS由资深专业团队开发维护，系统代码基于MIT开源软件许可协议。

## MyEMS架构
![MyEMS Architecture](/.readme/architecture.png)

## MyEMS组件(标准版 )

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

### MyEMS API接口

参考仓库  [myems-api](https://github.com/myems/myems-api.git) 获取更多信息。

### MyEMS MQTT 发布服务

参考仓库  [myems-mqtt-publisher](https://github.com/myems/myems-mqtt-publisher.git) 获取更多信息。

### MyEMS BACnet/IP 服务

参考仓库  [myems-bacnet](https://github.com/myems/myems-bacnet.git) 获取更多信息。

## 版本对比
| 功能                            |                      标准版                               | 企业版  |
| :---                               |                       :----:                                  |  :----:    |
| 开源                            | ✔️                                                           | ❌ |
| 定价模式                    | 免费                                                       | 按项目付费 |
| Modbus  TCP 协议     | ✔️                                                           | ✔️ |
| BACnet/IP 协议         | ✔️                                                           | ✔️ |
| MQTT  协议              | ✔️                                                           | ✔️ |
| 点数无限制               | ✔️                                                           | ✔️ |
| 计量表数无限制       | ✔️                                                            | ✔️ |
| 虚拟表数无限制        | ✔️                                                            | ✔️ |
| 用能单位数无限制    | ✔️                                                            | ✔️ |
| Docker 容器部署        | ✔️                                                           | ✔️ |
| Kubernetes部署           | ✔️                                                           | ✔️ |
| MySQL                        | ✔️                                                           | ✔️ |
| MariaDB                       | ✔️                                                           | ✔️ |
| MemSQL                     | ✔️                                                           | ✔️ |
| AWS 云部署                | ✔️                                                          | ✔️ |
| AZure 云部署              | ✔️                                                          | ✔️ |
| 阿里云部署                 | ✔️                                                          | ✔️ |
| 能耗报告                     | ✔️                                                           | ✔️ |
| 能源费用                     | ✔️                                                           | ✔️ |
| 能耗排名                    | ✔️                                                           | ✔️ |
| 能耗概览页                | ✔️                                                           | ✔️ |
| 能流图分析                | ✔️                                                           | ✔️ |
| 配电系统分析            | ✔️                                                           | ✔️ |
| 设备能效分析            | ✔️                                                           | ✔️ |
| 租户能耗分析            | ✔️                                                           | ✔️ |
| REST API                   | ✔️                                                          | ✔️ |
| Web APP                     |✔️                                                           | ✔️ |
| 在线支持                    |✔️                                                           | ✔️ |
| 邮件支持                    |✔️                                                           | ✔️ |
| Modbus  RTU  协议   | ❌                                                           | ✔️ |
| OPC UA 协议            | ❌                                                           | ✔️ |
| OPC DA 协议            | ❌                                                           | ✔️ |
| Siemens S7 协议        | ❌                                                           | ✔️|
| IEC 104 协议             | ❌                                                           | ✔️|
| Johnson Controls Metasys | ❌                                                   | ✔️|
| Honeywell EBI           | ❌                                                          | ✔️|
| FDD  规则引擎          | ❌                                                          | ✔️ |
| 高级报表                    |❌                                                           | ✔️ |
| 组态图形绘制工具    | ❌                                                          | ✔️ |
| BACnet Server           | ❌                                                          | ✔️|
| iOS APP                     | ❌                                                          | ✔️ |
| Android APP              | ❌                                                          | ✔️ |
| 第三方系统集成服务| ❌                                                          | ✔️ |
| 电话技术支持服务    |❌                                                          | ✔️ |
| 微信技术支持服务    |❌                                                          | ✔️ |
| 远程技术支持服务    |❌                                                          | ✔️ |
| 现场技术支持服务    |❌                                                          | ✔️ |
| 投标技术支持服务    |❌                                                          | ✔️ |
| 定制技术支持服务    |❌                                                          | ✔️ |

## MyEMS Introduction
 MyEMS is an advanced Energy Management System that is built on cloud computing, IOT, Big Data and AI technologies. MyEMS can be used to build an standard and powerful integrated energy management service platform.
MyEMS is developed and maintained by an experienced development team, and the source code is under MIT license.

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

### MyEMS MQTT Service

See the repository [myems-mqtt-publisher](https://github.com/myems/myems-mqtt-publisher.git) for more information.

### MyEMS BACnet/IP Service

See the repository [myems-bacnet](https://github.com/myems/myems-bacnet.git) for more information.

## Compare Editions
| Features                       | Standard Edition                                    | Enterprise Edition  |
| :---                               |                       :----:                                  |  :----:    |
| Open Source                | ✔️ MIT                                                  | ❌ |
| Pricing Model             | Free                                                        | Pay for Projects |
| Modbus  TCP             | ✔️                                                           | ✔️ |
| BACnet/IP                  | ✔️                                                           | ✔️ |
| MQTT                        | ✔️                                                           | ✔️ |
| Unlimited Number of Points | ✔️                                                | ✔️ |
| Unlimited Number of Meters | ✔️                                                | ✔️ |
| Unlimited Number of Virtual Meters | ✔️                                    | ✔️ |
| Unlimited Number of Spaces | ✔️                                                | ✔️ |
| Docker                         | ✔️                                                           | ✔️ |
| Kubernetes                   | ✔️                                                           | ✔️ |
| MySQL                        | ✔️                                                           | ✔️ |
| MemSQL                     | ✔️                                                           | ✔️ |
| AWS Cloud                  | ✔️                                                          | ✔️ |
| AZure Cloud                | ✔️                                                          | ✔️ |
| Alibaba Cloud              | ✔️                                                          | ✔️ |
| Energy Reporting        | ✔️                                                           | ✔️ |
| Energy Billing             | ✔️                                                           | ✔️ |
| Energy Ranking          | ✔️                                                           | ✔️ |
| Energy Dashboard      | ✔️                                                           | ✔️ |
| Energy Flow Diagram | ✔️                                                          | ✔️ |
| Distribution System     | ✔️                                                          | ✔️ |
| Equipment Efficiency | ✔️                                                           | ✔️ |
| Tenant                         | ✔️                                                           | ✔️ |
| RESTful API               | ✔️                                                          | ✔️ |
| Web APP                     |✔️                                                           | ✔️ |
| Online Support            |✔️                                                           | ✔️ |
| Email Support             |✔️                                                           | ✔️ |
| Modbus  RTU             | ❌                                                           | ✔️ |
| OPC UA                     | ❌                                                           | ✔️ |
| OPC DA                     | ❌                                                           | ✔️ |
| Siemens S7                 | ❌                                                           | ✔️|
| IEC 104                      | ❌                                                           | ✔️|
| Johnson Controls Metasys | ❌                                                   | ✔️|
| Honeywell EBI           | ❌                                                          | ✔️|
| FDD  Rule Engine      | ❌                                                          | ✔️ |
| Advanced Reporting   |❌                                                           | ✔️ |
| Draw Diagrams Tool   | ❌                                                         | ✔️ |
| BACnet Server           | ❌                                                          | ✔️|
| iOS APP                     | ❌                                                          | ✔️ |
| Android APP              | ❌                                                          | ✔️ |
| 3rd Party Systems Integration | ❌                                             | ✔️ |
| Telephone Support      |❌                                                          | ✔️ |
| WeChat Support         |❌                                                          | ✔️ |
| Remote Support          |❌                                                          | ✔️ |
| Onsite Support            |❌                                                          | ✔️ |
| Bid Support                 |❌                                                          | ✔️ |
| Customize Support      |❌                                                          | ✔️ |
