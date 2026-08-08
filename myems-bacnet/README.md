# MyEMS BACnet Service


## Introduction

This service is a component of MyEMS to acquire data from BACnet devices

## Prerequisites

mysql-connector-python

bacpypes

python-decouple

schedule

### Installation 

Option 1: Install on Docker

In this section, you will install myems-bacnet on Docker.

* Copy source code to root directory

On Windows:
```bash
cp -r myems-bacnet c:\
cd c:\myems-bacnet
```

On Linux:
```bash
cp -r myems-bacnet /
cd /myems-bacnet
```

* Create .env file based on example.env file

Manually replace ~~127.0.0.1~~ with actual **HOST** IP address.

Set BACNET_DEVICE_LOCAL_ADDRESS to 172.18.0.8
```bash
cp example.env .env
```

* Build a Docker image
```bash
docker build -t myems-bacnet .
```

To build for multiple platforms and not only for the architecture and operating system that the user invoking the build happens to run.
You can use buildx and set the --platform flag to specify the target platform for the build output, (for example, linux/amd64, linux/arm64, or darwin/amd64).
```bash
docker buildx build --platform=linux/amd64 -t myems-bacnet .
```

* Run a Docker container

Setting up static IP for BACnet Local Device

Because BACNET_DEVICE_LOCAL_ADDRESS needs a static IP address, so we have to create a custom sub-network:
```bash
docker network create --subnet=172.18.0.0/16 myems
```
Ensure that BACNET_DEVICE_LOCAL_ADDRESS is 172.18.0.8 in .env file

* Run a Docker container on Linux with dummy license file (run as superuser)
```bash
docker run -d --net myems --ip 172.18.0.8  -v /myems-bacnet/.env:/app/.env:ro -v /myems-bacnet/license.lic:/app/license.lic:ro --log-opt max-size=1m --log-opt max-file=2 --restart always --name myems-bacnet myems-bacnet
```

* Run a Docker container on Windows with dummy license file (Run as Administrator)
```bash
docker run -d --net myems --ip 172.18.0.8 -v c:\myems-bacnet\.env:/app/.env:ro -v c:\myems-bacnet\license.lic:/app/license.lic:ro --log-opt max-size=1m --log-opt max-file=2 --restart always --name myems-bacnet myems-bacnet
```

* -d Run container in background and print container ID

* -p Publish a container's port(s) to the host, 8000:8000 (Host:Container) binds port 8000 (right)  of the container to 
TCP port 8000 (left) of the host machine.

* -v If you use -v or --volume to bind-mount a file or directory that does not yet exist on the Docker host, 
-v creates the endpoint for you. It is always created as a directory. 
The ro option, if present, causes the bind mount to be mounted into the container as read-only.

* --log-opt max-size=2m The maximum size of the log before it is rolled. A positive integer plus a modifier representing the unit of measure (k, m, or g).

* --log-opt max-file=2 The maximum number of log files that can be present. If rolling the logs creates excess files, the oldest file is removed. A positive integer. 

* --restart Restart policy to apply when a container exits

* --name Assign a name to the container

The absolute path before colon is for path on host  and that may vary on your system.
The absolute path after colon is for path on container and that CANNOT be changed.
By passing .env as bind-mount parameter, you can change the configuration values later.
If you changed .env file, restart the container to make the change effective.

If you want to immigrate the image to another computer,
* Export image to tarball file
```bash
docker save --output myems-bacnet.tar myems-bacnet
```
* Copy the tarball file to another computer, and then load image from tarball file
```bash
docker load --input .\myems-bacnet.tar
```

### Installation Option 2: Online install on Ubuntu server with internet access

In this section, you will install myems-bacnet on Ubuntu Server with internet access.

```bash
cp -r myems-bacnet /myems-bacnet
cd /myems-bacnet
sudo pip install -r requirements.txt
```

Copy example.env file to .env and modify the .env file:
```bash
cp /myems-bacnet/example.env /myems-bacnet/.env
nano /myems-bacnet/.env
```
Setup systemd service:
```bash
cp myems-bacnet.service /lib/systemd/system/
```
Enable the service:
```bash
systemctl enable myems-bacnet.service
```
Start the service:
```bash
systemctl start myems-bacnet.service
```
Monitor the service:
```bash
systemctl status myems-bacnet.service
```
View the log:
```bash
cat /myems-bacnet.log
```

### Add Data Sources and Points in MyEMS Admin UI

Data source protocol: 
```
bacnet-ip
```

Data source connection example:
```
{"host": "192.168.0.3", "port": 47808}
```

Point address example:
```
{"object_id":3002786,"object_type":"analogValue","property_array_index":null,"property_name":"presentValue"}
```


## References

[1]. http://myems.cn
  
[2]. http://bacnet.org
  
[3]. https://github.com/JoelBender/bacpypes