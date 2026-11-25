## myems-aggregation

数据汇总服务

## 简介

本服务是 MyEMS 的组件之一，用于将规范化后的数据按多个维度进行汇总。

## 依赖

mysql-connector-python

python-decouple


## 开发环境快速运行

```bash
cd myems/myems-aggregation
pip install -r requirements.txt
cp example.env .env
chmod +x run.sh
./run.sh
```

## 安装

### 方式 1：使用 Docker 安装 myems-aggregation

详见 [myems.cn](https://myems.cn/docs/installation/docker-linux#step-7-myems-aggregation)

### 方式 2：在有网络的 Ubuntu Server 上在线安装 myems-aggregation

详见 [myems.cn](https://myems.cn/docs/installation/debian-ubuntu#step-7-myems-aggregation)

### 方式 3：在无网络的 Ubuntu Server 上离线安装 myems-aggregation

本节介绍如何在无网络的 Ubuntu Server 上安装 myems-aggregation。

在任意有网络的服务器上下载：
```bash
cd ~/tools
wget https://cdn.mysql.com//Downloads/Connector-Python/mysql-connector-python-8.0.28.tar.gz
git clone https://github.com/henriquebastos/python-decouple.git
cd ~
git clone https://github.com/MyEMS/myems.git
```

将文件复制到无网络的服务器并安装依赖：
```bash
cd ~/tools
tar xzf mysql-connector-python-8.0.28.tar.gz
cd ~/tools/mysql-connector-python-8.0.28
python3 setup.py install
cd ~/tools/python-decouple
python3 setup.py  install
```

安装 myems-aggregation 服务：
```bash
cp -r myems/myems-aggregation /myems-aggregation
cd /myems-aggregation
```
将 example.env 复制为 .env 并修改：
```bash
cp /myems-aggregation/example.env /myems-aggregation/.env
nano /myems-aggregation/.env
```
配置 systemd 服务：
```bash
cp myems-aggregation.service /lib/systemd/system/
```
启用服务：
```bash
systemctl enable myems-aggregation.service
```
启动服务：
```bash
systemctl start myems-aggregation.service
```
查看服务状态：
```bash
systemctl status myems-aggregation.service
```
查看日志：
```bash
cat /myems-aggregation.log
```

### 参考资料

[1]. https://myems.cn

[2]. https://dev.mysql.com/doc/connector-python/en/

[3]. https://github.com/henriquebastos/python-decouple/
