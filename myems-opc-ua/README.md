## MyEMS OPC UA Service

###Introduction

This service is a component of MyEMS to acquire data from OPC UA server.

### Dependencies

mysql-connector-python

asyncua

schedule

python-decouple

telnetlib3

### Quick Run for Development

```bash
cd myems/myems-opc-ua
pip install -r requirements.txt
cp example.env .env
chmod +x run.sh
./run.sh
```

### Installation

### Option 1: Install myems-opc-ua on Docker

In this section, you will install myems-opc-ua on Docker.

* Copy source code to root directory

On Windows:
```bash
cp -r myems-opc-ua c:\
cd c:\myems-opc-ua
```

On Linux:
```bash
cp -r myems-opc-ua /
cd /myems-opc-ua
```

* Create .env file based on example.env file

Manually replace ~~127.0.0.1~~ with real **HOST** IP address.

```bash
cp example.env .env
```

* Build a Docker image
```bash
docker build -t myems-opc-ua .
```

To build for multiple platforms and not only for the architecture and operating system that the user invoking the build happens to run.
You can use buildx and set the --platform flag to specify the target platform for the build output, (for example, linux/amd64, linux/arm64, or darwin/amd64).
```bash
docker buildx build --platform=linux/amd64 -t myems/myems-opc-ua .
```

* Export the Docker image

To immigrate the image to another computer,
* Export image to tarball file
```bash
docker save --output myems-opc-ua.tar myems-opc-ua
```

* Copy the tarball file to another computer, and then load image from tarball file
```bash
docker load --input .\myems-opc-ua.tar
```

* Run a Docker container on Linux with dummy license file (run as superuser)
```bash
docker run -d -v /myems-opc-ua/.env:/code/.env:ro -v /myems-opc-ua/license.lic:/code/license.lic:ro --log-opt max-size=1m --log-opt max-file=2 --restart always --name myems-opc-ua myems-opc-ua
```

* Run a Docker container on Windows with dummy license file (Run as Administrator)
```bash
docker run -d -v c:\myems-opc-ua\.env:/code/.env:ro -v c:\myems-opc-ua\license.lic:/code/license.lic:ro --log-opt max-size=1m --log-opt max-file=2 --restart always --name myems-opc-ua myems-opc-ua
```

* -d Run container in background and print container ID

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

Find and send the full container ID to MyEMS sales to obtain a valid license.lic file
```bash
docker ps --all --no-trunc
```

Replace the dummy license.lic with the true license.lic file and restart the container
```bash
docker restart COMTAINER-ID
```

### Installation Option 2: Online install on Ubuntu server with internet access

In this section, you will install myems-opc-ua on Ubuntu Server with internet access.

Copy source code to root directory:
```bash
cp -r myems-opc-ua /myems-opc-ua
cd /myems-opc-ua
pip install --no-cache-dir -r requirements.txt
```
Copy example.env file to .env and modify the .env file:
```bash
cp /myems-opc-ua/example.env /myems-opc-ua/.env
nano /myems-opc-ua/.env
```
Setup systemd service:
```bash
cp myems-opc-ua.service /lib/systemd/system/
```
Enable the service:
```bash
systemctl enable myems-opc-ua.service
```
Start the service:
```bash
systemctl start myems-opc-ua.service
```
Monitor the service:
```bash
systemctl status myems-opc-ua.service
```
View the log:
```bash
cat /myems-opc-ua.log
```

### Add Data Sources and Points in MyEMS Admin

Input Data source protocol:
```
opc-ua
```
Input data source connection (example):
```
{"url": "opc.tcp://192.168.0.1:49320/OPCUA/Server/","interval_in_seconds":60}
```

Input point address (example):
```
{"node_id":"ns=5;s=Counter1"}
```

Alternatively, you can use SQL scripts (example):
```
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_data_sources`(`id`, `name`, `uuid`, `protocol`, `connection`)
VALUES
(1000231, 'OPC UA Server', 'a3502b7f-09e5-4066-9ce8-032e4f488930', 'opc-ua', '{"url":"opc.tcp://192.168.0.1:53530/OPCUA/Server/","interval_in_seconds":60}');

COMMIT;

INSERT INTO `myems_system_db`.`tbl_points`(`id`, `name`, `data_source_id`, `object_type`, `units`, `high_limit`, `low_limit`, `ratio`, `is_trend`, `address`)
VALUES
 (1004540, 'Counter', 1000231, 'DIGITAL_VALUE', 'NA', 99999999999, 0, 1.0, 1, '{"node_id":"ns=3;s=Counter"}'),
 (1004541, 'Expression', 1000231, 'ANALOG_VALUE', 'NA', 99999999999, 0, 1.0, 1,  '{"node_id":"ns=3;s=Expression"}'),
 (1004542, 'Random', 1000231, 'ANALOG_VALUE', 'NA', 99999999999, 0, 1.0, 1,  '{"node_id":"ns=3;s=Random"}'),
 (1004543, 'Sawtooth', 1000231, 'ANALOG_VALUE', 'NA', 99999999999, 0, 1.0, 1,  '{"node_id":"ns=3;s=Sawtooth"}'),
 (1004544, 'Sinusoid', 1000231, 'ANALOG_VALUE', 'NA', 99999999999, 0, 1.0, 1,  '{"node_id":"ns=3;s=Sinusoid"}'),
 (1004545, 'Square', 1000231, 'ANALOG_VALUE', 'NA', 99999999999, 0, 1.0, 1,  '{"node_id":"ns=3;s=Square"}'),
 (1004546, 'Triangle', 1000231, 'ANALOG_VALUE', 'NA', 99999999999, 0, 1.0, 1,  '{"node_id":"ns=3;s=Triangle"}');

COMMIT;
```

### References
[1]. https://myems.cn

[2]. https://github.com/myems/myems

[3]. https://github.com/FreeOpcUa/opcua-asyncio

[4]. https://opcfoundation.org/
