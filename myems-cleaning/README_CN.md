# myems-cleaning

MyEMS 数据清洗服务

## 简介

本服务是 MyEMS 的组件之一，用于清洗历史数据。

## 依赖

mysql-connector-python

schedule

python-decouple

## 开发环境快速运行
```bash
cd myems/myems-cleaning
pip install -r requirements.txt
cp example.env .env
chmod +x run.sh
./run.sh
```

## 安装

### 方式 1：使用 Docker 安装 myems-cleaning

详见 [myems.cn](https://myems.cn/docs/installation/docker-linux#step-5-myems-cleaning)

### 安装方式 2：在有网络的 Ubuntu 服务器上在线安装

详见 [myems.cn](https://myems.cn/docs/installation/debian-ubuntu#step-5-myems-cleaning)

### 安装方式 3：在无网络的 Ubuntu 服务器上离线安装

本节介绍如何在 Ubuntu Server 上安装 myems-cleaning。

下载并安装 MySQL Connector：
```bash
cd ~/tools
wget https://cdn.mysql.com//Downloads/Connector-Python/mysql-connector-python-8.0.28.tar.gz
tar xzf mysql-connector-python-8.0.28.tar.gz
cd ~/tools/mysql-connector-python-8.0.28
python3 setup.py install
```

下载并安装 Schedule：
```bash
cd ~/tools
git clone https://github.com/dbader/schedule.git
cd ~/tools/schedule
python3 setup.py install
```

下载并安装 Python Decouple：
```bash
cd ~/tools
git clone https://github.com/henriquebastos/python-decouple.git
cd ~/tools/python-decouple
python3 setup.py  install
```

安装 myems-cleaning 服务：
```bash
cp -r myems/myems-cleaning /myems-cleaning
cd /myems-cleaning
```
将 example.env 复制为 .env 并编辑：
```bash
cp /myems-cleaning/example.env /myems-cleaning/.env
nano /myems-cleaning/.env
```
配置 systemd 服务：
```bash
cp myems-cleaning.service /lib/systemd/system/
```
启用服务：
```bash
systemctl enable myems-cleaning.service
```
启动服务：
```bash
systemctl start myems-cleaning.service
```
查看服务状态：
```bash
systemctl status myems-cleaning.service
```
查看日志：
```bash
cat /myems-cleaning.log
```

### 参考资料

[1]. https://myems.cn

[2]. https://dev.mysql.com/doc/connector-python/en/
