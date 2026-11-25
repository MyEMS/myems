## MyEMS OPC UA 服务

### 简介

本服务是 MyEMS 的组件之一，用于从 OPC UA 服务器采集数据。

### 依赖

mysql-connector-python

asyncua

schedule

python-decouple

telnetlib3

### 开发环境快速运行

```bash
cd myems-opc-ua
pip install -r requirements.txt
cp example.env .env
chmod +x run.sh
./run.sh
```

在 Ubuntu 24.04 上，pip 默认不允许安装到系统 Python，需要加上 `--break-system-packages`：

```bash
pip install -r requirements.txt --break-system-packages
```

### 安装

### 方式 1：使用 Docker 安装 myems-opc-ua

本节介绍如何在 Docker 上安装 myems-opc-ua。

* 将源代码复制到根目录

Windows：
```bash
cp -r myems-opc-ua c:\
cd c:\myems-opc-ua
```

Linux：
```bash
sudo cp -r myems-opc-ua /
cd /myems-opc-ua
```

* 根据 example.env 创建 .env 文件

请手动将 ~~127.0.0.1~~ 替换为实际 **HOST** IP 地址。
```bash
cp example.env .env
```

* 构建 Docker 镜像
```bash
docker build -t myems-opc-ua .
```

若要为其他 Linux 架构构建，可使用 buildx，并将 `--platform` 设为 `linux/amd64` 或 `linux/arm64`。加上 `--load`，镜像才能在本机用于 `docker save` 和 `docker run`。`--load` 一次只能指定一个平台。
```bash
docker buildx build --platform=linux/amd64 --load -t myems-opc-ua .
```

* 导出 Docker 镜像

若要将镜像迁移到另一台计算机：
* 将镜像导出为 tar 文件
```bash
docker save --output myems-opc-ua.tar myems-opc-ua
```

* 将 tar 文件复制到另一台计算机，然后从 tar 文件加载镜像

Linux：
```bash
docker load --input ./myems-opc-ua.tar
```

Windows：
```bash
docker load --input .\myems-opc-ua.tar
```

* 在 Linux 上运行 Docker 容器（需超级用户权限）
```bash
sudo docker run -d -v /myems-opc-ua/.env:/app/.env:ro --log-opt max-size=1m --log-opt max-file=2 --restart always --name myems-opc-ua myems-opc-ua
```

* 在 Windows 上运行 Docker 容器（以管理员身份运行）
```bash
docker run -d -v c:\myems-opc-ua\.env:/app/.env:ro --log-opt max-size=1m --log-opt max-file=2 --restart always --name myems-opc-ua myems-opc-ua
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
冒号后的绝对路径是 `/app/.env`。镜像 `WORKDIR` 为 `/app`，该容器路径不能更改。
通过将 .env 作为绑定挂载参数传入，后续可修改配置值。
若修改了 .env 文件，请重启容器使更改生效：
```bash
sudo docker restart myems-opc-ua
```

### 安装方式 2：在有网络的 Ubuntu 服务器上在线安装

本节介绍如何在有网络的 Ubuntu Server 上安装 myems-opc-ua。
请在包含 `myems-opc-ua` 的目录下执行以下命令。

服务文件启动的是 `/usr/bin/python3`。
```bash
sudo apt-get update
sudo apt-get install -y python3 python3-pip
```
安装 Python 包：
```bash
sudo cp -r myems-opc-ua /myems-opc-ua
cd /myems-opc-ua
sudo pip install -r requirements.txt
```

在 Ubuntu 24.04 上，若 pip 提示 externally managed environment，请使用：
```bash
sudo pip install -r requirements.txt --break-system-packages
```

将 example.env 复制为 .env 并修改：
```bash
sudo cp /myems-opc-ua/example.env /myems-opc-ua/.env
sudo nano /myems-opc-ua/.env
```
配置 systemd 服务：
```bash
sudo cp myems-opc-ua.service /lib/systemd/system/
sudo systemctl daemon-reload
```
启用服务：
```bash
sudo systemctl enable myems-opc-ua.service
```
启动服务：
```bash
sudo systemctl start myems-opc-ua.service
```
查看服务状态：
```bash
sudo systemctl status myems-opc-ua.service
```
查看服务输出：
```bash
sudo journalctl -u myems-opc-ua.service
```
进程也会把错误信息追加到 `/myems-opc-ua.log`：
```bash
cat /myems-opc-ua.log
```

### 在 MyEMS Admin 中配置数据源与点位

注意：无需重启。主进程每 60 秒重新加载数据源，
每个采集进程在每个周期都会重新加载其点位。

数据源的 `gateway_id` 必须与 .env 中的 `GATEWAY_ID` 相同，
且该网关的 token 必须与 `GATEWAY_TOKEN` 相同。服务只会采集属于本网关的数据源。

数据源协议填写：
```
opc-ua
```
数据源连接配置示例：
```
{"url": "opc.tcp://192.168.0.1:49320/OPCUA/Server/","interval_in_seconds":60}
```

点位地址示例：
```
{"node_id":"ns=5;s=Counter1"}
```

也可以使用 SQL 脚本（示例）：
```
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_data_sources`(`id`, `name`, `uuid`, `protocol`, `gateway_id`, `connection`)
VALUES
(1000231, 'OPC UA Server', 'a3502b7f-09e5-4066-9ce8-032e4f488930', 'opc-ua', 1, '{"url":"opc.tcp://192.168.0.1:53530/OPCUA/Server/","interval_in_seconds":60}');

COMMIT;

INSERT INTO `myems_system_db`.`tbl_points`(`id`, `name`, `data_source_id`, `object_type`, `units`, `high_limit`, `low_limit`, `ratio`, `address`)
VALUES
 (1004540, 'Counter', 1000231, 'ENERGY_VALUE', 'kWh', 99999999999, 0, 1.0, '{"node_id":"ns=3;i=1001"}'),
 (1004541, 'Expression', 1000231, 'ANALOG_VALUE', 'NA', 99999999999, 0, 1.0,  '{"node_id":"ns=3;i=1002"}'),
 (1004542, 'Random', 1000231, 'ANALOG_VALUE', 'NA', 99999999999, 0, 1.0,  '{"node_id":"ns=3;i=1003"}'),
 (1004543, 'Sawtooth', 1000231, 'ANALOG_VALUE', 'NA', 99999999999, 0, 1.0,  '{"node_id":"ns=3;i=1004"}'),
 (1004544, 'Sinusoid', 1000231, 'ANALOG_VALUE', 'NA', 99999999999, 0, 1.0,  '{"node_id":"ns=3;i=1005"}'),
 (1004545, 'Square', 1000231, 'ANALOG_VALUE', 'NA', 99999999999, 0, 1.0,  '{"node_id":"ns=3;i=1006"}'),
 (1004546, 'Triangle', 1000231, 'ANALOG_VALUE', 'NA', 99999999999, 0, 1.0,  '{"node_id":"ns=3;i=1007"}');

COMMIT;
```

### 参考资料

[1]. https://myems.cn

[2]. https://github.com/myems/myems

[3]. https://github.com/FreeOpcUa/opcua-asyncio

[4]. https://opcfoundation.org/
