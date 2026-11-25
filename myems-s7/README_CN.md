## MyEMS S7 服务


### 简介

本服务是 MyEMS 的组件之一，用于采集 S7 设备数据。

### 依赖

mysql-connector-python
python-snap7
schedule
python-decouple
telnetlib3

### 开发环境快速运行

```bash
cd myems-s7
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

### 方式 1：使用 Docker 安装 myems-s7

本节介绍如何在 Docker 上安装 myems-s7。

* 将源代码复制到根目录

Windows：
```bash
cp -r myems-s7 c:\
cd c:\myems-s7
```

Linux：
```bash
sudo cp -r myems-s7 /
cd /myems-s7
```

* 根据 example.env 创建 .env 文件

请手动将 ~~127.0.0.1~~ 替换为实际 **HOST** IP 地址。
```bash
cp example.env .env
```

* 构建 Docker 镜像
```bash
docker build -t myems-s7 .
```

* 导出 Docker 镜像

若要将镜像迁移到另一台计算机：
* 将镜像导出为 tar 文件
```bash
docker save --output myems-s7.tar myems-s7
```

* 将 tar 文件复制到另一台计算机，然后从 tar 文件加载镜像

Linux：
```bash
docker load --input ./myems-s7.tar
```

Windows：
```bash
docker load --input .\myems-s7.tar
```

* 在 Linux 上运行 Docker 容器（需超级用户权限）
```bash
sudo docker run -d -v /myems-s7/.env:/app/.env:ro --log-opt max-size=1m --log-opt max-file=2 --restart always --name myems-s7 myems-s7
```

* 在 Windows 上运行 Docker 容器（以管理员身份运行）
```bash
docker run -d -v c:\myems-s7\.env:/app/.env:ro --log-opt max-size=1m --log-opt max-file=2 --restart always --name myems-s7 myems-s7
```

* -d 在后台运行容器并打印容器 ID

* -v 若使用 -v 或 --volume 绑定挂载尚未存在于 Docker 主机上的文件或目录，
-v 会为你创建该端点，且始终创建为目录。
若存在 ro 选项，则将该绑定挂载以只读方式挂载到容器中。

* --log-opt max-size=1m 日志滚动前的最大大小。正整数加上表示单位的修饰符（k、m 或 g）。

* --log-opt max-file=2 可保留的最大日志文件数。若滚动日志产生多余文件，会删除最旧的文件。正整数。

* --restart 容器退出时应用的重启策略

* --name 为容器指定名称

若修改了 .env 文件，请重启容器使更改生效：
```bash
sudo docker restart myems-s7
```
### 安装方式 2：在有网络的 Ubuntu 服务器上在线安装

本节介绍如何在有网络的 Ubuntu Server 上安装 myems-s7。
请在包含 `myems-s7` 的目录下执行以下命令。

安装 Python 和 Snap7。服务文件启动的是 `/usr/bin/python`，Ubuntu 通过 `python-is-python3` 提供该命令。
```bash
sudo apt-get update
sudo apt-get install -y software-properties-common python3-pip python-is-python3
sudo add-apt-repository -y ppa:gijzelaar/snap7
sudo apt-get update
sudo apt-get install -y libsnap7-1 libsnap7-dev
```
安装 Python-Snap7 及其他依赖：
```bash
sudo cp -r myems-s7 /myems-s7
cd /myems-s7
sudo pip install -r requirements.txt
```

在 Ubuntu 24.04 上，若 pip 提示 externally managed environment，请使用：
```bash
sudo pip install -r requirements.txt --break-system-packages
```

将 example.env 复制为 .env 并修改：
```bash
sudo cp /myems-s7/example.env /myems-s7/.env
sudo nano /myems-s7/.env
```
配置 systemd 服务：
```bash
sudo cp myems-s7.service /lib/systemd/system/
sudo systemctl daemon-reload
```
启用服务：
```bash
sudo systemctl enable myems-s7.service
```
启动服务：
```bash
sudo systemctl start myems-s7.service
```
查看服务状态：
```bash
sudo systemctl status myems-s7.service
```
查看服务输出：
```bash
sudo journalctl -u myems-s7.service
```
进程也会把错误信息追加到 `/myems-s7.log`：
```bash
cat /myems-s7.log
```

### PLC 块属性
在块属性的 Attributes 中，取消勾选 “Optimized block access”（优化的块访问）。


### 在 MyEMS Admin 中配置数据源与点位

注意：如果修改了 S7 数据源或点位，请重启本服务：
```bash
sudo systemctl restart myems-s7.service
```

数据源协议填写：
```
s7
```
数据源连接配置示例：
```
{"host":"192.168.0.2", "rack": 0, "slot": 1, "port":102, "interval_in_seconds":300}
```

点位地址示例：
```
{"area":"DB", "db_number":700, "start":8, "size":4, "type":"real", "byte_index":0, "bool_index":0}
```

Bool 示例。`bool_index` 是由 `byte_index` 选定字节中的 bit 位：
```
{"area":"DB", "db_number":700, "start":0, "size":1, "type":"bool", "byte_index":0, "bool_index":0}
```

* 地址 | Area

`area` 取下表中的名称之一。

| 名称 | Snap7 区域 | 说明 |
|---------------|------------|-------------------------------------------|
| PE            | S7AreaPE   | 过程输入 |
| PA            | S7AreaPA   | 过程输出 |
| MK            | S7AreaMK   | 标志位 |
| DB            | S7AreaDB   | 数据块 |
| CT            | S7AreaCT   | 计数器 |
| TM            | S7AreaTM   | 定时器 |

* 地址 | DB Number
  当 `area` 为 `DB` 时的数据块编号。对 PE、PA、MK、CT、TM 使用 0。

* 地址 | Start
  开始读取的字节偏移

* 地址 | Size
  要读取的字节数。允许值为 1、2、3、4。

* 地址 | Type
  `real`、`bool`、`int` 或 `byte`

* 地址 | byte_index
  刚读到的字节中的字节索引。从第一个字节解码时使用 0。

* 地址 | bool_index
  该字节内的 bit 索引（0-7）。服务对每个点位都要求提供该字段。`type` 为 `bool` 时会用到；其他类型填 0。

### 参考资料

[1]. http://myems.cn

[2]. http://snap7.sourceforge.net/

[3]. https://github.com/gijzelaerr/python-snap7

[4]. https://python-snap7.readthedocs.io

[5]. http://snap7.sourceforge.net/siemens_dataformat.html
