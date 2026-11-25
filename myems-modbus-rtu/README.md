## MyEMS Modbus RTU Service

Chinese version: [README_CN.md](README_CN.md)

### Introduction

This service is a component of MyEMS to acquire data from Modbus RTU devices over serial ports.

This software supports Modbus RTU and Modbus ASCII serial communication.

### Dependencies

mysql-connector-python

minimalmodbus

pyserial

schedule

python-decouple

### Quick Run for Development

```bash
cd myems-modbus-rtu
pip install -r requirements.txt
cp example.env .env
chmod +x run.sh
./run.sh
```

### Installation

### Option 1: Install myems-modbus-rtu on Docker

Build and run with Docker. Serial ports are mapped with `--device`, not with `-p` port publishing.

#### Single serial port

```bash
docker build -t myems-modbus-rtu .
docker run --device=/dev/ttyUSB0 --env-file .env myems-modbus-rtu
```

The path inside the container remains `/dev/ttyUSB0`. Use the same path in the data source connection:

```json
{"port":"/dev/ttyUSB0","slaveaddress":1,"baudrate":9600,"bytesize":8,"parity":"N","stopbits":1,"timeout":0.5,"write_timeout":2.0,"mode":"rtu","interval_in_seconds":60}
```

#### Multiple serial ports

Pass one `--device` for each serial port:

```bash
docker run \
  --device=/dev/ttyUSB0 \
  --device=/dev/ttyUSB1 \
  --device=/dev/ttyAMA3 \
  --env-file .env \
  myems-modbus-rtu
```

Or map host path to container path explicitly:

```bash
docker run \
  --device=/dev/ttyUSB0:/dev/ttyUSB0 \
  --device=/dev/ttyUSB1:/dev/ttyUSB1 \
  --env-file .env \
  myems-modbus-rtu
```

Docker Compose example:

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

#### Mapping and MyEMS configuration

This service requires **one data source per serial port**.

| Host device | Path in container | Admin data source connection |
| --- | --- | --- |
| `/dev/ttyUSB0` | `/dev/ttyUSB0` | `"port":"/dev/ttyUSB0"` |
| `/dev/ttyUSB1` | `/dev/ttyUSB1` | `"port":"/dev/ttyUSB1"` |

Multiple slaves on the same RS485 bus: map that one serial port only, create **one** data source, and distinguish slaves with point-level `slave_id`.

#### Prefer `/dev/serial/by-id` to avoid USB renumbering

`/dev/ttyUSB0` may become `/dev/ttyUSB1` after replug. Prefer stable by-id paths:

```bash
ls -l /dev/serial/by-id/
```

```bash
docker run \
  --device=/dev/serial/by-id/usb-XXX-if00:/dev/ttyUSB0 \
  --env-file .env \
  myems-modbus-rtu
```

The data source can still use `"port":"/dev/ttyUSB0"` because that is the fixed path inside the container.

#### Permissions

- The sample image runs as root by default and can usually access serial devices.
- If you switch to a non-root user, add the user to `dialout`, or ensure the device node permissions are sufficient.
- Prefer `--device` over `--privileged`.

Restart the container after changing device mappings or data source settings.

Docker log file path:

```
/app/myems-modbus-rtu.log
```

### Installation Option 2: Online install on Ubuntu server with internet access

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

Monitor the service:

```bash
systemctl status myems-modbus-rtu.service
```

View the log:

```bash
cat /myems-modbus-rtu.log
```

### Add Data Sources and Points in MyEMS Admin UI

NOTE: If you modified Modbus RTU data sources and points, please restart this service:

```bash
systemctl restart myems-modbus-rtu.service
```

IMPORTANT:

- Use **one data source per serial port**. Do not create multiple data sources that open the same `/dev/ttyUSB0` (or similar). Multiple slaves on the same RS485 bus should share one data source and use point-level `slave_id`.
- Connection numeric fields such as `slaveaddress`, `baudrate`, and `timeout` must be JSON numbers, not strings.
- Prefer `timeout` >= 0.3. A value such as `0.05` is often too short at 9600 baud and can cause false timeouts.

Input Data source protocol:

```
modbus-rtu
```

Data source connection example:

```json
{"port":"/dev/ttyUSB0","slaveaddress":1,"baudrate":9600,"bytesize":8,"parity":"N","stopbits":1,"timeout":0.5,"write_timeout":2.0,"mode":"rtu","interval_in_seconds":60}
```

Point address example (float, with explicit slave id):

```json
{"slave_id":1,"function_code":4,"offset":8192,"number_of_registers":2,"format":">f","byte_swap":false}
```

Float meter example (uses data source `slaveaddress` when `slave_id` is omitted):

```json
{"function_code":4,"offset":8192,"number_of_registers":2,"format":">f","byte_swap":false}
```

32-bit integer example:

```json
{"function_code":3,"offset":0,"number_of_registers":2,"format":">i","byte_swap":false}
```

16-bit register example:

```json
{"function_code":4,"offset":0,"number_of_registers":1,"format":">H","byte_swap":false}
```

Single coil / discrete input example:

```json
{"function_code":1,"offset":0,"number_of_registers":1,"format":">H","byte_swap":false}
```

### Address

#### port

Serial port device path, for example `/dev/ttyUSB0` or `/dev/ttyAMA3`.

#### slaveaddress

Default Modbus slave address for the data source. Valid range: 1-247. Must be a JSON number.

#### slave_id

Optional point-level slave address. If omitted, the data source `slaveaddress` is used. Use this to poll multiple slaves on the same serial port from one data source.

#### baudrate / bytesize / parity / stopbits

Serial parameters. `baudrate` and `bytesize` must be JSON numbers. `parity` is typically `N`, `E`, or `O`.

#### timeout / write_timeout

Serial read/write timeout in seconds. Recommended read `timeout` is `0.5` or higher for slow meters.

#### mode

`rtu` or `ascii`. Default is `rtu`.

#### interval_in_seconds

Acquisition interval in seconds. Valid range: 0-3600. Default is 300 when omitted or invalid.

#### function_code

```
01 (0x01) Read Coils
02 (0x02) Read Discrete Inputs
03 (0x03) Read Holding Registers
04 (0x04) Read Input Registers
```

#### offset

The starting register or coil address.

#### number_of_registers

The number of registers (or bits for function codes 01/02) to read.

Supported combinations used by this service:

| format | number_of_registers | notes |
| --- | --- | --- |
| `>f` / `<f` | 2 | 32-bit float |
| `>d` / `<d` | 4 | 64-bit float |
| `>i` / `<i` / `>I` / `<I` / `>l` / `<l` / `>L` / `<L` | 2 | 32-bit integer |
| `>h` / `>H` | 1 | 16-bit register |
| coil/discrete | 1 | function code 01 or 02, single bit |

Do not use multi-bit coil reads (`number_of_registers` > 1 with function code 01/02). Prefer big-endian formats such as `>f`, `>H`, and `>i` unless the device documentation requires otherwise.

#### format

Python `struct`-style format string. See the supported combinations above.

#### byte_swap

A boolean indicates whether or not to swap adjacent bytes for 32-bit or 64-bit values. Byte order is controlled by `>` / `<` in `format`.

### Runtime Behavior

- Serial hard faults such as USB disconnect reopen the port immediately.
- Soft faults such as no response or CRC error skip the point. After 3 consecutive soft faults, the port is closed and reopened.
- Successfully read values in the same cycle are stored before a reconnect.
- `last_seen_datetime_utc` is updated only when at least one point value is stored.

### Test

```bash
python3 test.py /dev/ttyUSB0 1 8192 4 ">f" 2
```

### References

[1]. http://myems.cn

[2]. http://www.modbus.org/tech.php

[3]. https://github.com/pyhys/minimalmodbus

[4]. https://docs.python.org/3/library/struct.html#format-strings
