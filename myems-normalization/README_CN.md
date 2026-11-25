# myems-normalization

数据规范化服务

## 简介

本服务是 MyEMS 的组件之一，用于规范化历史数据库中的能源数据。

![MyEMS Meter Normalization](../docs/images/meter-normalization.png)

## 依赖

mysql-connector-python

openpyxl

sympy

python-decouple


## 开发环境快速运行

```bash
cd myems/myems-normalization
pip install -r requirements.txt
cp example.env .env
chmod +x run.sh
./run.sh
```

## 安装

### 方式 1：使用 Docker 安装 myems-normalization

详见 [myems.cn](https://myems.cn/docs/installation/docker-linux#step-6-myems-normalization)

### 安装方式 2：在有网络的 Ubuntu 服务器上在线安装

详见 [myems.cn](https://myems.cn/docs/installation/debian-ubuntu#step-6-myems-normalization)

### 安装方式 3：在无网络的 Ubuntu 服务器上离线安装

本节介绍如何在 Ubuntu Server 上安装 myems-normalization。

下载并安装 MySQL Connector：
```bash
cd ~/tools
wget https://cdn.mysql.com//Downloads/Connector-Python/mysql-connector-python-8.0.28.tar.gz
tar xzf mysql-connector-python-8.0.28.tar.gz
cd ~/tools/mysql-connector-python-8.0.28
python3 setup.py install
```

下载并安装 mpmath：
```bash
cd ~/tools
git clone https://github.com/fredrik-johansson/mpmath.git
cd ~/tools/mpmath
python3 setup.py install
```

下载并安装 SymPy：
```bash
cd ~/tools
git clone https://github.com/sympy/sympy.git
cd ~/tools/sympy
python3 setupegg.py develop
```

下载并安装 openpyxl：
```bash
cd ~/tools
```
从 https://foss.heptapod.net/openpyxl/et_xmlfile/ 获取最新版 et_xmlfile：
```bash
wget https://foss.heptapod.net/openpyxl/et_xmlfile/-/archive/1.1/et_xmlfile-1.1.tar.gz
tar xzf et_xmlfile-1.1.tar.gz
```
获取 jdcal：
```bash
git clone https://github.com/phn/jdcal.git
```
从 https://foss.heptapod.net/openpyxl/openpyxl 获取最新版 openpyxl：
```bash
wget https://foss.heptapod.net/openpyxl/openpyxl/-/archive/3.0.7/openpyxl-3.0.7.tar.gz
tar xzf openpyxl-3.0.7.tar.gz
```

```bash
cd ~/tools/et_xmlfile-1.1
python3 setup.py install
cd ~/tools/jdcal
python3 setup.py install
cd ~/tools/openpyxl-3.0.7
python3 setup.py install
```

下载并安装 Python Decouple：
```bash
cd ~/tools
git clone https://github.com/henriquebastos/python-decouple.git
cd ~/tools/python-decouple
python3 setup.py  install
```

安装 myems-normalization 服务：
```bash
cp -r myems/myems-normalization /myems-normalization
cd /myems-normalization
```
将 example.env 复制为 .env 并修改：
```bash
cp /myems-normalization/example.env /myems-normalization/.env
nano /myems-normalization/.env
```
配置 systemd 服务：
```bash
cp myems-normalization.service /lib/systemd/system/
```
启用服务：
```bash
systemctl enable myems-normalization.service
```
启动服务：
```bash
systemctl start myems-normalization.service
```
查看服务状态：
```bash
systemctl status myems-normalization.service
```
查看日志：
```bash
cat /myems-normalization.log
```

### 参考资料

[1]. https://myems.cn

[2]. https://dev.mysql.com/doc/connector-python/en/

[3]. https://github.com/sympy/sympy

[4]. https://openpyxl.readthedocs.io
