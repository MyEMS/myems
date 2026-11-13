## MyEMS S7 Service


### Introduction

This service is one of components of MyEMS to acquire data from S7 devices.

### Prerequisites

mysql-connector-python
python-snap7
schedule
python-decouple
telnetlib3

### Quick Run for Development

```bash
cd myems-s7
pip install -r requirements.txt
cp example.env .env
chmod +x run.sh
./run.sh
```

On Ubuntu 24.04, pip refuses to install into the system Python until you add `--break-system-packages`:

```bash
pip install -r requirements.txt --break-system-packages
```

### Installation

### Option 1: Install myems-s7 on Docker

In this section, you will install myems-s7 on Docker.

* Copy source code to root directory

On Windows:
```bash
cp -r myems-s7 c:\
cd c:\myems-s7
```

On Linux:
```bash
sudo cp -r myems-s7 /
cd /myems-s7
```

* Create .env file based on example.env

Manually replace ~~127.0.0.1~~ with real **HOST** IP address.
```bash
cp example.env .env
```

* Build a Docker image
```bash
docker build -t myems-s7 .
```

* Export the Docker image

To migrate the image to another computer,
* Export image to tarball file
```bash
docker save --output myems-s7.tar myems-s7
```

* Copy the tarball file to another computer, and then load image from tarball file

On Linux:
```bash
docker load --input ./myems-s7.tar
```

On Windows:
```bash
docker load --input .\myems-s7.tar
```

* Run a Docker container on Linux (run as superuser)
```bash
sudo docker run -d -v /myems-s7/.env:/app/.env:ro --log-opt max-size=1m --log-opt max-file=2 --restart always --name myems-s7 myems-s7
```

* Run a D
* ocker container on Windows (Run as Administrator)
```bash
docker run -d -v c:\myems-s7\.env:/app/.env:ro --log-opt max-size=1m --log-opt max-file=2 --restart always --name myems-s7 myems-s7
```

* -d Run container in background and print container ID

* -v If you use -v or --volume to bind-mount a file or directory that does not yet exist on the Docker host,
-v creates the endpoint for you. It is always created as a directory.
The ro option, if present, causes the bind mount to be mounted into the container as read-only.

* --log-opt max-size=1m The maximum size of the log before it is rolled. A positive integer plus a modifier representing the unit of measure (k, m, or g).

* --log-opt max-file=2 The maximum number of log files that can be present. If rolling the logs creates excess files, the oldest file is removed. A positive integer.

* --restart Restart policy to apply when a container exits

* --name Assign a name to the container

If you change the .env file, restart the container to apply it:
```bash
sudo docker restart myems-s7
```
### Installation Option 2: Online install on Ubuntu server with internet access

In this section, you will install myems-s7 on Ubuntu Server with internet access.
Run the commands below from the directory that contains `myems-s7`.

Install Python and Snap7. The service file starts `/usr/bin/python`, which Ubuntu provides through `python-is-python3`.
```bash
sudo apt-get update
sudo apt-get install -y software-properties-common python3-pip python-is-python3
sudo add-apt-repository -y ppa:gijzelaar/snap7
sudo apt-get update
sudo apt-get install -y libsnap7-1 libsnap7-dev
```
Install Python-Snap7 and other prerequisites:
```bash
sudo cp -r myems-s7 /myems-s7
cd /myems-s7
sudo pip install -r requirements.txt
```

On Ubuntu 24.04, if pip reports an externally managed environment, install with:
```bash
sudo pip install -r requirements.txt --break-system-packages
```

Copy example.env file to .env and modify the .env file:
```bash
sudo cp /myems-s7/example.env /myems-s7/.env
sudo nano /myems-s7/.env
```
Setup systemd service:
```bash
sudo cp myems-s7.service /lib/systemd/system/
sudo systemctl daemon-reload
```
Enable the service:
```bash
sudo systemctl enable myems-s7.service
```
Start the service:
```bash
sudo systemctl start myems-s7.service
```
Monitor the service:
```bash
sudo systemctl status myems-s7.service
```
View service output:
```bash
sudo journalctl -u myems-s7.service
```
The process also appends error messages to `/myems-s7.log`:
```bash
cat /myems-s7.log
```

### PLC Block Properties
Uncheck 'Optimized block access' in Attributes of Block Properties


### Add Data Sources and Points in MyEMS Admin

NOTE: If you modified S7 data sources and points, please restart this service:
```bash
sudo systemctl restart myems-s7.service
```

Input Data source protocol:
```
s7
```
Input data source connection (example):
```
{"host":"192.168.0.2", "rack": 0, "slot": 1, "port":102, "interval_in_seconds":300}
```

Input point address (example):
```
{"area":"DB", "db_number":700, "start":8, "size":4, "type":"real", "byte_index":0, "bool_index":0}
```

Bool example. `bool_index` is the bit inside the byte selected by `byte_index`:
```
{"area":"DB", "db_number":700, "start":0, "size":1, "type":"bool", "byte_index":0, "bool_index":0}
```

* Address | Area

`area` is one of the names below.

| Name          | Snap7 area | Description                               |
|---------------|------------|-------------------------------------------|
| PE            | S7AreaPE   | Process Inputs                            |
| PA            | S7AreaPA   | Process Outputs                           |
| MK            | S7AreaMK   | Merkers                                   |
| DB            | S7AreaDB   | Data block                                |
| CT            | S7AreaCT   | Counters                                  |
| TM            | S7AreaTM   | Timers                                    |

* Address | DB Number
  The data block number when `area` is `DB`. Use 0 for PE, PA, MK, CT, and TM.

* Address | Start
  The byte offset at which to start reading

* Address | Size
  The number of bytes to read. Allowed values are 1, 2, 3, and 4.

* Address | Type
  `real`, `bool`, `int`, or `byte`

* Address | byte_index
  The byte index inside the bytes just read. Use 0 to decode from the first byte.

* Address | bool_index
  The bit index (0-7) inside that byte. Required by the service for every point. It is used when `type` is `bool`; use 0 for other types.

### References

[1]. http://myems.cn

[2]. http://snap7.sourceforge.net/

[3]. https://github.com/gijzelaerr/python-snap7

[4]. https://python-snap7.readthedocs.io

[5]. http://snap7.sourceforge.net/siemens_dataformat.html


