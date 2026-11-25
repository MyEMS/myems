## MyEMS Modbus TCP 服务

### 简介

本服务是 MyEMS 的组件之一，用于采集 Modbus TCP 设备数据。

### 依赖

mysql-connector-python

modbus_tk

schedule

python-decouple

telnetlib3

### 开发环境快速运行

```bash
cd myems/myems-modbus-tcp
pip install -r requirements.txt
cp example.env .env
chmod +x run.sh
./run.sh
```

### 安装

### 方式 1：使用 Docker 安装 myems-modbus-tcp

详见 [myems.cn](https://myems.cn/docs/installation/docker-linux#step-4-myems-modbus-tcp)

### 方式 2：在有网络的 Ubuntu 服务器上在线安装

详见 [myems.cn](https://myems.cn/docs/installation/debian-ubuntu#step-4-myems-modbus-tcp)

### 方式 3：在无网络的 Ubuntu 服务器上离线安装

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

下载并安装 modbus-tk：
```bash
cd ~/tools
git clone https://github.com/pyserial/pyserial.git
cd ~/tools/pyserial
python3 setup.py install
git clone https://github.com/ljean/modbus-tk.git
cd ~/tools/modbus-tk
python3 setup.py install
```

安装 myems-modbus-tcp 服务：
```bash
cp -r myems/myems-modbus-tcp /myems-modbus-tcp
cd /myems-modbus-tcp
```
根据 example.env 创建 .env 文件，并按需编辑：
```bash
cp /myems-modbus-tcp/example.env /myems-modbus-tcp/.env
nano /myems-modbus-tcp/.env
```
配置 systemd 服务：
```bash
cp myems-modbus-tcp.service /lib/systemd/system/
```
启用服务：
```bash
systemctl enable myems-modbus-tcp.service
```
启动服务：
```bash
systemctl start myems-modbus-tcp.service
```
查看服务状态：
```bash
systemctl status myems-modbus-tcp.service
```
查看日志：
```bash
cat /myems-modbus-tcp.log
```

### 在 MyEMS Admin 中配置数据源与点位

注意：如果修改了 Modbus TCP 数据源或点位，请重启本服务：
```bash
systemctl restart myems-modbus-tcp.service
```

数据源协议填写：
```
modbus-tcp
```
数据源连接配置示例：
```
{"host":"10.9.67.99","port":502,"interval_in_seconds":60}
```

点位地址示例：
```
{"slave_id":1, "function_code":3, "offset":0, "number_of_registers":2, "format":"<f", "byte_swap":true}
```

### 地址字段说明

#### slave_id
    从站 ID

#### function_code
```
    01 (0x01) 读线圈
    02 (0x02) 读离散量输入
    03 (0x03) 读保持寄存器
    04 (0x04) 读输入寄存器
    23 (0x17) 读/写多个寄存器
```

#### offset
    请求 PDU 中指定的起始寄存器地址

#### number_of_registers
    请求 PDU 中指定的寄存器数量

#### format
使用 Python3 的 struct 库格式化字节。
Python bytes 对象用于保存表示 C struct 的数据，也用作格式字符串（见下文）来描述 C struct 中的数据布局。

可选的首个格式字符表示字节序、大小和对齐：
    @: 本地字节序、大小与对齐（默认）
    =: 本地字节序、标准大小与对齐
    <: 小端、标准大小与对齐
    >: 大端、标准大小与对齐
    !: 与 > 相同

其余字符表示参数类型，且必须精确匹配；
前面可以加十进制重复次数：
    x: 填充字节（无数据）；c:char；b:有符号字节；B:无符号字节；
    ?: _Bool（需要 C99；不可用时用 char 代替）
    h:short；H:无符号 short；i:int；I:无符号 int；
    l:long；L:无符号 long；f:float；d:double。

特殊情况（前面的十进制计数表示长度）：
    s:string（char 数组）；p: pascal string（带长度字节）。
特殊情况（仅本地格式可用）：
    n:ssize_t；N:size_t；
    P: 足以存放指针的整数类型。

特殊情况（非本地模式，除非平台 C 支持 'long long'）：
    q:long long；Q:unsigned long long

格式之间的空白会被忽略。

#### byte_swap
布尔值，表示是否交换相邻字节。
对 32 位（4 字节）或 64 位（8 字节）数据进行相邻字节交换。
这不是小端/大端交换，字节序请使用 format。
仅当 number_of_registers 为 2（32 位）或 4（64 位）时生效，否则忽略。

### 参考资料

[1]. http://myems.cn

[2]. https://github.com/myems/myems

[3]. http://www.modbus.org/tech.php

[4]. https://github.com/ljean/modbus-tk

[5]. https://docs.python.org/3/library/struct.html#format-strings
