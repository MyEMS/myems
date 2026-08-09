## MyEMS S7 Service


### Introduction

This service is one of components of MyEMS to acquire data from S7 devices.

### Prerequisites

Snap7

python-snap7

mysql-connector-python

schedule

python-decouple

### Quick Run for Development

```bash
cd myems-s7
pip install -r requirements.txt
cp example.env .env
chmod +x run.sh
./run.sh
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
cp -r myems-s7 /
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

To immigrate the image to another computer,
* Export image to tarball file
```bash
docker save --output myems-s7.tar myems-s7
```

* Copy the tarball file to another computer, and then load image from tarball file
```bash
docker load --input .\myems-s7.tar
```

* Run a Docker container on Linux (run as superuser)
```bash
docker run -d -v /myems-s7/.env:/app/.env:ro --log-opt max-size=1m --log-opt max-file=2 --restart always --name myems-s7 myems-s7
```

* Run a Docker container on Windows (Run as Administrator)
```bash
docker run -d -v c:\myems-s7\.env:/app/.env:ro -v --log-opt max-size=1m --log-opt max-file=2 --restart always --name myems-s7 myems-s7
```

* -d Run container in background and print container ID

* -v If you use -v or --volume to bind-mount a file or directory that does not yet exist on the Docker host,
-v creates the endpoint for you. It is always created as a directory.
The ro option, if present, causes the bind mount to be mounted into the container as read-only.

* --log-opt max-size=2m The maximum size of the log before it is rolled. A positive integer plus a modifier representing the unit of measure (k, m, or g).

* --log-opt max-file=2 The maximum number of log files that can be present. If rolling the logs creates excess files, the oldest file is removed. A positive integer.

* --restart Restart policy to apply when a container exits

* --name Assign a name to the container


```bash
sudo docker restart myems-s7
```
### Installation Option 2: Online install on Ubuntu server with internet access

In this section, you will install myems-s7 on Ubuntu Server with internet access.
Install Snap7:
```bash
sudo add-apt-repository ppa:gijzelaar/snap7
sudo apt-get update
sudo apt-get install libsnap7-1 libsnap7-dev
```
Install Python-Snap7 and other prerequisites
```bash
cp -r myems-s7 /myems-s7
cd /myems-s7
pip install -r requirements.txt
```

Copy example.env file to .env and modify the .env file:
```bash
cp /myems-s7/example.env /myems-s7/.env
nano /myems-s7/.env
```
Setup systemd service:
```bash
cp myems-s7.service /lib/systemd/system/
```
Enable the service:
```bash
systemctl enable myems-s7.service
```
Start the service:
```bash
systemctl start myems-s7.service
```
Monitor the service:
```bash
systemctl status myems-s7.service
```
View the log:
```bash
cat /myems-s7.log
```

### PLC Block Properties
Uncheck 'Optimized block access' in Attributes of Block Properties


### Add Data Sources and Points in MyEMS Admin
refer to https://github.com/myems/myesm-admin.git

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
{"host":"192.168.0.2", "rack": 0, "slot": 1, "port":102}
```

Input point address (example):
```
{"area":"DB", "db_number":700, "start":8, "size":4, "type":"real", "offset":null}
```

* Address | Area Type

| Name          | Area Type | Description                               |
|---------------|-----------|-------------------------------------------|
| PE            | S7AreaPE  | Process Inputs                            |
| PA            | S7AreaPA  | Process Outputs                           |
| MK            | S7AreaMK  | Merkers                                   |
| DB            | S7AreaDB  | DB                                        |
| CT            | S7AreaCT  | Counters                                  |
| TM            | S7AreaTM  | Timers                                    |

* Address | DB Number
  The DB number, only used when area= S7AreaDB otherwise 0

* Address | Start
  The offset to start reading

* Address | Size
  The number of units to read

* Address | Type
  'real', 'bool', 'int'

* Address | Offset
  The bit offset of the byte, only used when Type is 'bool' otherwise null

### References

[1]. http://myems.cn

[2]. http://snap7.sourceforge.net/

[3]. https://github.com/gijzelaerr/python-snap7

[4]. https://python-snap7.readthedocs.io

[5]. http://snap7.sourceforge.net/siemens_dataformat.html


