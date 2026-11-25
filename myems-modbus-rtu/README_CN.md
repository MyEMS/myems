## MyEMS Modbus RTU 服务

### 简介

本服务是 MyEMS 的组件之一，用于通过串口采集 Modbus RTU 设备数据。

支持 Modbus RTU 与 Modbus ASCII 串口通信。

### 依赖

mysql-connector-python

minimalmodbus

pyserial

schedule

python-decouple

### 开发环境快速运行

```bash
cd myems-modbus-rtu
pip install -r requirements.txt
cp example.env .env
chmod +x run.sh
./run.sh
```

### 安装

### 方式 1：使用 Docker 安装 myems-modbus-rtu

构建镜像并运行。串口要用**设备映射**（`--device`），不是端口映射（`-p`）。

#### 单个串口

```bash
docker build -t myems-modbus-rtu .
docker run --device=/dev/ttyUSB0 --env-file .env myems-modbus-rtu
```

容器内路径仍是 `/dev/ttyUSB0`，数据源 connection 里写：

```json
{"port":"/dev/ttyUSB0","slaveaddress":1,"baudrate":9600,"bytesize":8,"parity":"N","stopbits":1,"timeout":0.5,"write_timeout":2.0,"mode":"rtu","interval_in_seconds":60}
```

#### 多个串口

多写几个 `--device`：

```bash
docker run \
  --device=/dev/ttyUSB0 \
  --device=/dev/ttyUSB1 \
  --device=/dev/ttyAMA3 \
  --env-file .env \
  myems-modbus-rtu
```

或写成明确的宿主机→容器路径：

```bash
docker run \
  --device=/dev/ttyUSB0:/dev/ttyUSB0 \
  --device=/dev/ttyUSB1:/dev/ttyUSB1 \
  --env-file .env \
  myems-modbus-rtu
```

Docker Compose 示例：

```yaml
services:
  myems-modbus-rtu:
    image: myems-modbus-rtu
    env_file: .env
    devices:
      - /dev/ttyUSB0:/dev/ttyUSB0
      - /dev/ttyUSB1:/dev/ttyUSB1
    restart: unless-stopped
```

#### 和 MyEMS 配置的对应关系

本服务要求：**一个串口一个数据源**。

| 宿主机设备 | 容器内路径 | Admin 数据源 connection |
| --- | --- | --- |
| `/dev/ttyUSB0` | `/dev/ttyUSB0` | `"port":"/dev/ttyUSB0"` |
| `/dev/ttyUSB1` | `/dev/ttyUSB1` | `"port":"/dev/ttyUSB1"` |

同一条 RS485 上多个从站：只映射那一个串口，建**一个**数据源，点位用不同 `slave_id`。

#### 建议：用 by-id，避免 USB 重插后改名

`/dev/ttyUSB0` 可能变成 `/dev/ttyUSB1`。更稳的写法：

```bash
ls -l /dev/serial/by-id/
```

```bash
docker run \
  --device=/dev/serial/by-id/usb-XXX-if00:/dev/ttyUSB0 \
  --env-file .env \
  myems-modbus-rtu
```

数据源仍可写 `"port":"/dev/ttyUSB0"`（容器内固定名）。

#### 权限注意

- 官方示例镜像默认 root，一般可直接访问串口。
- 若改成非 root 用户，需把用户加入 `dialout`，或保证设备节点权限足够。
- 不推荐用 `--privileged` 图省事，能 `--device` 就别开特权。

改完设备映射或数据源后，重启容器/服务使配置生效。

Docker 日志路径：

```
/app/myems-modbus-rtu.log
```


### 方式 2：在有网络的 Ubuntu 服务器上在线安装

```bash
cp -r myems-modbus-rtu /myems-modbus-rtu
cd /myems-modbus-rtu
pip3 install -r requirements.txt
cp example.env .env
nano .env
cp myems-modbus-rtu.service /lib/systemd/system/
systemctl enable myems-modbus-rtu.service
systemctl start myems-modbus-rtu.service
```

查看服务状态：

```bash
systemctl status myems-modbus-rtu.service
```

查看日志：

```bash
cat /myems-modbus-rtu.log
```

### 在 MyEMS Admin 中配置数据源与点位

注意：如果修改了 Modbus RTU 数据源或点位，请重启本服务：

```bash
systemctl restart myems-modbus-rtu.service
```

重要说明：

- **一个串口只配置一个数据源**。不要让多个数据源同时打开同一个 `/dev/ttyUSB0`（或类似设备）。同一条 RS485 总线上的多个从站，应共用一个数据源，并通过点位上的 `slave_id` 区分。
- 连接配置中的数字字段（如 `slaveaddress`、`baudrate`、`timeout`）必须是 JSON 数字，不能写成字符串。
- 建议 `timeout` >= 0.3。在 9600 波特率下，`0.05` 通常过短，容易误判超时。

数据源协议填写：

```
modbus-rtu
```

数据源连接配置示例：

```json
{"port":"/dev/ttyUSB0","slaveaddress":1,"baudrate":9600,"bytesize":8,"parity":"N","stopbits":1,"timeout":0.5,"write_timeout":2.0,"mode":"rtu","interval_in_seconds":60}
```

点位地址示例（浮点数，显式指定从站地址）：

```json
{"slave_id":1,"function_code":4,"offset":8192,"number_of_registers":2,"format":">f","byte_swap":false}
```

浮点电表示例（省略 `slave_id` 时使用数据源的 `slaveaddress`）：

```json
{"function_code":4,"offset":8192,"number_of_registers":2,"format":">f","byte_swap":false}
```

32 位整数示例：

```json
{"function_code":3,"offset":0,"number_of_registers":2,"format":">i","byte_swap":false}
```

16 位寄存器示例：

```json
{"function_code":4,"offset":0,"number_of_registers":1,"format":">H","byte_swap":false}
```

单线圈 / 离散量输入示例：

```json
{"function_code":1,"offset":0,"number_of_registers":1,"format":">H","byte_swap":false}
```

### 地址字段说明

#### port

串口设备路径，例如 `/dev/ttyUSB0` 或 `/dev/ttyAMA3`。

#### slaveaddress

数据源默认从站地址。有效范围：1-247。必须是 JSON 数字。

#### slave_id

可选的点位级从站地址。省略时使用数据源的 `slaveaddress`。同一串口下采集多个从站时，用此字段区分。

#### baudrate / bytesize / parity / stopbits

串口参数。`baudrate` 和 `bytesize` 必须是 JSON 数字。`parity` 通常为 `N`、`E` 或 `O`。

#### timeout / write_timeout

串口读/写超时，单位秒。对响应较慢的仪表，建议读超时 `timeout` 设为 `0.5` 或更大。

#### mode

`rtu` 或 `ascii`。默认 `rtu`。

#### interval_in_seconds

采集周期，单位秒。有效范围：0-3600。省略或非法时默认 300。

#### function_code

```
01 (0x01) 读线圈
02 (0x02) 读离散量输入
03 (0x03) 读保持寄存器
04 (0x04) 读输入寄存器
```

#### offset

起始寄存器地址或线圈地址。

#### number_of_registers

读取的寄存器数量（功能码 01/02 时表示位数）。

本服务支持的组合：

| format | number_of_registers | 说明 |
| --- | --- | --- |
| `>f` / `<f` | 2 | 32 位浮点数 |
| `>d` / `<d` | 4 | 64 位浮点数 |
| `>i` / `<i` / `>I` / `<I` / `>l` / `<l` / `>L` / `<L` | 2 | 32 位整数 |
| `>h` / `>H` | 1 | 16 位寄存器 |
| coil/discrete | 1 | 功能码 01 或 02，单 bit |

不要使用多 bit 线圈读取（功能码 01/02 且 `number_of_registers` > 1）。除非设备文档另有要求，优先使用大端格式，例如 `>f`、`>H`、`>i`。

#### format

Python `struct` 风格的格式字符串，参见上表支持组合。

#### byte_swap

布尔值，表示是否对 32 位或 64 位数值交换相邻字节。字节序由 `format` 中的 `>` / `<` 决定。

### 运行行为

- USB 掉线等硬故障会立即关闭并重新打开串口。
- 无应答、CRC 错误等软故障会跳过该点；连续 3 次软故障后关闭并重新打开串口。
- 同一轮中已成功读取的点值会先入库，再执行重连。
- 只有至少成功存储一个点值时，才会更新 `last_seen_datetime_utc`。

### 测试

```bash
python3 test.py /dev/ttyUSB0 1 8192 4 ">f" 2
```

### 参考资料

[1]. http://myems.cn

[2]. http://www.modbus.org/tech.php

[3]. https://github.com/pyhys/minimalmodbus

[4]. https://docs.python.org/3/library/struct.html#format-strings
