# MyEMS BACnet 服务


## 简介

本服务是 MyEMS 的组件之一，用于采集 BACnet 设备数据。

## 依赖

mysql-connector-python

bacpypes

python-decouple

schedule

### 安装

方式 1：使用 Docker 安装

本节介绍如何在 Docker 上安装 myems-bacnet。

* 将源代码复制到根目录

Windows：
```bash
cp -r myems-bacnet c:\
cd c:\myems-bacnet
```

Linux：
```bash
sudo cp -r myems-bacnet /
cd /myems-bacnet
```

* 根据 example.env 创建 .env 文件

请手动将 ~~127.0.0.1~~ 替换为实际 **HOST** IP 地址。

将 BACNET_DEVICE_LOCAL_ADDRESS 设置为 172.18.0.8
```bash
sudo cp example.env .env
```

* 构建 Docker 镜像
```bash
sudo docker build -t myems-bacnet .
```

若要为多个平台构建，而不仅限于当前调用构建的架构和操作系统，
可使用 buildx，并通过 --platform 指定目标平台（例如 linux/amd64、linux/arm64）。
```bash
sudo docker buildx build --platform=linux/amd64 -t myems-bacnet .
```

* 运行 Docker 容器

为 BACnet 本地设备设置静态 IP

因为 BACNET_DEVICE_LOCAL_ADDRESS 需要静态 IP，所以需要创建自定义子网：
```bash
sudo docker network create --subnet=172.18.0.0/16 myems
```
确保 .env 文件中 BACNET_DEVICE_LOCAL_ADDRESS 为 172.18.0.8

* 在 Linux 上运行 Docker 容器（需超级用户权限）
```bash
sudo docker run -d --net myems --ip 172.18.0.8  -v /myems-bacnet/.env:/app/.env:ro --log-opt max-size=1m --log-opt max-file=2 --restart always --name myems-bacnet myems-bacnet
```

* 在 Windows 上运行 Docker 容器（以管理员身份运行）
```bash
docker run -d --net myems --ip 172.18.0.8 -v c:\myems-bacnet\.env:/app/.env:ro --log-opt max-size=1m --log-opt max-file=2 --restart always --name myems-bacnet myems-bacnet
```

* -d 在后台运行容器并打印容器 ID

* -v 若使用 -v 或 --volume 绑定挂载尚未存在于 Docker 主机上的文件或目录，
-v 会为你创建该端点，且始终创建为目录。
若存在 ro 选项，则将该绑定挂载以只读方式挂载到容器中。

* --log-opt max-size=1m 日志滚动前的最大大小。正整数加上表示单位的修饰符（k、m 或 g）。

* --log-opt max-file=2 可保留的最大日志文件数。若滚动日志产生多余文件，会删除最旧的文件。正整数。

* --restart 容器退出时应用的重启策略

* --name 为容器指定名称

冒号前的绝对路径是宿主机路径，可能因系统而异。
冒号后的绝对路径是容器内路径，**不能更改**。
通过将 .env 作为绑定挂载参数传入，后续可修改配置值。
若修改了 .env 文件，请重启容器使更改生效。

若要将镜像迁移到另一台计算机：
* 将镜像导出为 tar 文件
```bash
sudo docker save --output myems-bacnet.tar myems-bacnet
```
* 将 tar 文件复制到另一台计算机，然后从 tar 文件加载镜像
```bash
sudo docker load --input myems-bacnet.tar
```

### 安装方式 2：在有网络的 Ubuntu 服务器上在线安装

本节介绍如何在有网络的 Ubuntu Server 上安装 myems-bacnet。

```bash
sudo cp -r myems-bacnet /myems-bacnet
cd /myems-bacnet
sudo pip3 install -r requirements.txt
```

将 example.env 复制为 .env 并修改：
```bash
sudo cp /myems-bacnet/example.env /myems-bacnet/.env
sudo nano /myems-bacnet/.env
```
配置 systemd 服务：
```bash
sudo cp myems-bacnet.service /lib/systemd/system/
sudo systemctl daemon-reload
```
启用服务：
```bash
sudo systemctl enable myems-bacnet.service
```
启动服务：
```bash
sudo systemctl start myems-bacnet.service
```
查看服务状态：
```bash
sudo systemctl status myems-bacnet.service
```
查看日志：
```bash
cat /myems-bacnet.log
```

### 在 MyEMS Admin 中配置数据源与点位

数据源协议：
```
bacnet-ip
```

数据源连接配置示例：
```
{"host": "192.168.0.3"}
```

点位地址示例：
```
{"object_id":3002786,"object_type":"analogValue","property_array_index":null,"property_name":"presentValue"}
```


## 参考资料

[1]. http://myems.cn

[2]. http://bacnet.org

[3]. https://github.com/JoelBender/bacpypes
