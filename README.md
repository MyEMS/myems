# MyEMS

 [中文](./README.md) | [EN](./README_EN.md) | [DE](./README_DE.md)

 [![Documentation Status](https://readthedocs.org/projects/myems/badge/?version=latest)](https://myems.readthedocs.io/en/latest/?badge=latest)


## MyEMS 介绍

MyEMS是行业领先的开源能源管理系统，利用云计算、物联网、大数据、人工智能等信息化技术构建而成。MyEMS可用于构建统一规范、功能强大的综合能源管理服务平台。MyEMS由资深专业团队开发维护，系统代码基于MIT开源软件许可协议发布。

## MyEMS架构
![MyEMS Architecture](/docs/images/architecture.png)

## MyEMS组件(社区版 )

MyEMS项目由下列组件构成:

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

## MyEMS截图
![MyEMS Screenshot](/docs/images/screenshot-2020.12.01-16_53_12.png)

## 功能版本对比
| 功能                              |社区版(MyEMS)   |企业版(AlbertEOS)|
| :---                             |      :----:   |  :----: |
| 开源                              | ✔️             | ❌      |
| 定价模式                          | 免费           | 按项目付费 |
| 更换品牌名称与标志LOGO              | ✔️             | ✔️        |
| Modbus TCP 协议                   | ✔️             | ✔️        |
| BACnet/IP 协议                    | ✔️             | ✔️        |
| MQTT 协议发布数据                  | ✔️             | ✔️        |
| 数据点数                           | 无限制         |无限制     |
| 计量表数                           | 无限制         |无限制     |
| 设备数                             | 无限制         |无限制     |
| 用能单位数                         | 无限制         |无限制     |
| Docker容器化部署                    | ✔️             | ✔️        |
| Kubernetes部署                    | ✔️             | ✔️        |
| MySQL                            | ✔️             | ✔️        |
| MariaDB                          | ✔️             | ✔️        |
| SingleStore                      | ✔️             | ✔️        |
| AWS 云部署                        | ✔️             | ✔️        |
| AZure 云部署                      | ✔️             | ✔️        |
| 阿里云部署                         | ✔️             | ✔️        |
| 私有云部署                         | ✔️             | ✔️        |
| 总览页                            | ✔️             | ✔️        |
| 数据比较分析（同比、环比、自由比）     | ✔️             | ✔️        |
| 数据分析结果导出到Excel              | ✔️             | ✔️        |
| 空间数据/能耗分类分析                | ✔️             | ✔️        |
| 空间数据/能耗分项分析                | ✔️             | ✔️        |
| 空间数据/成本分析                   | ✔️             | ✔️        |
| 空间数据/产出分析                   | ✔️             | ✔️        |
| 空间数据/收入分析                   | ✔️             | ✔️        |
| 空间数据/效率分析                   | ✔️             | ✔️        |
| 空间数据/负荷分析                   | ✔️             | ✔️        |
| 空间数据/统计分析                   | ✔️             | ✔️        |
| 空间数据/节能分析                   | ❌            | ✔️        |
| 设备数据/能耗分类分析                | ✔️             | ✔️        |
| 设备数据/能耗分项分析                | ✔️             | ✔️        |
| 设备数据/成本分析                   | ✔️             | ✔️        |
| 设备数据/产出分析                   | ✔️             | ✔️        |
| 设备数据/收入分析                   | ✔️             | ✔️        |
| 设备数据/效率分析                   | ✔️             | ✔️        |
| 设备数据/负荷分析                   | ✔️             | ✔️        |
| 设备数据/统计分析                   | ✔️             | ✔️        |
| 设备数据/节能分析                   | ❌            | ✔️        |
| 设备数据/设备台账                   | ✔️             | ✔️        |
| 计量表数据/能耗分析                 | ✔️             | ✔️        |
| 计量表数据/成本分析                 | ✔️             | ✔️        |
| 计量表数据/趋势分析                 | ✔️             | ✔️        |
| 计量表数据/实时分析                 | ✔️             | ✔️        |
| 计量表数据/总分表平衡分析            | ✔️             | ✔️        |
| 计量表数据/离线表能耗分析            | ✔️             | ✔️        |
| 计量表数据/离线表成本分析            | ✔️             | ✔️        |
| 计量表数据/虚拟表能耗分析            | ✔️             | ✔️        |
| 计量表数据/虚拟表成本分析             | ✔️             | ✔️        |
| 计量表数据/计量表台账                | ✔️             | ✔️        |
| 租户数据/能耗分类分析                | ✔️             | ✔️        |
| 租户数据/能耗分项分析                | ✔️             | ✔️        |
| 租户数据/成本分析                   | ✔️             | ✔️        |
| 租户数据/负荷分析                   | ✔️             | ✔️        |
| 租户数据/统计分析                   | ✔️             | ✔️        |
| 租户数据/节能分析                   | ❌             | ✔️        |
| 租户数据/租户账单                   | ✔️             | ✔️        |
| 门店数据/能耗分类分析                | ✔️             | ✔️        |
| 门店数据/能耗分项分析                | ✔️             | ✔️        |
| 门店数据/成本分析                   | ✔️             | ✔️        |
| 门店数据/负荷分析                   | ✔️             | ✔️        |
| 门店数据/统计分析                   | ✔️             | ✔️        |
| 门店数据/节能分析                   | ❌             | ✔️        |
| 车间数据/能耗分类分析                | ✔️             | ✔️        |
| 车间数据/能耗分项分析                | ✔️             | ✔️        |
| 车间数据/成本分析                   | ✔️             | ✔️        |
| 车间数据/负荷分析                   | ✔️             | ✔️        |
| 车间数据/统计分析                   | ✔️             | ✔️        |
| 车间数据/节能分析                   | ❌            | ✔️        |
| 组合设备数据/成本分析                | ✔️             | ✔️        |
| 组合设备数据/产出分析                | ✔️             | ✔️        |
| 组合设备数据/收入分析                | ✔️             | ✔️        |
| 组合设备数据/效率分析                | ✔️             | ✔️        |
| 组合设备数据/负荷分析                | ✔️             | ✔️        |
| 组合设备数据/统计分析                | ✔️             | ✔️        |
| 组合设备数据/节能分析                | ❌            | ✔️        |
| 能流图分析                         | ✔️             | ✔️        |
| 配电系统分析                       | ✔️             | ✔️        |
| REST API                         | ✔️             | ✔️        |
| Web APP                          | ✔️             | ✔️        |
| MQTT 协议订阅数据                  | ❌            | ✔️        |
| Modbus RTU 协议                   | ❌            | ✔️        |
| OPC UA 协议                       | ❌            | ✔️        |
| OPC DA 协议                       | ❌            | ✔️        |
| Siemens S7 协议                   | ❌            | ✔️        |
| IEC 104 协议                      | ❌            | ✔️        |
| Johnson Controls Metasys         | ✔️             | ✔️        |
| Honeywell EBI                    | ✔️             | ✔️        |
| SIEMENS Desigo CC                | ❌            | ✔️        |
| FDD 能效故障诊断规系统              | ❌            | ✔️        |
| 高级报表系统                       | ❌            | ✔️        |
| 组态图形绘制工具                    | ❌            | ✔️        |
| 设备远程控制                       | ❌            | ✔️        |
| BACnet Server                    | ❌            | ✔️        |
| iOS APP                          | ❌            | ✔️        |
| Android APP                      | ❌            | ✔️        |
| 工控机硬件网关(数据采集和远程控制）    | ❌           | ✔️        |
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
