## MyEMS Aggregation Service 数据汇总服务

### Introduction

This service is a component of MyEMS and it aggregates normalized data up to multiple dimensions.

### Prerequisites

mysql-connector-python

python-decouple

### Quick Run for Development

```bash
pip install -r requirements.txt
chmod +x run.sh
run.sh
```

### Installation

Download and install MySQL Connector:
```bash
cd ~/tools
wget https://dev.mysql.com/get/Downloads/Connector-Python/mysql-connector-python-8.0.20.tar.gz
tar xzf mysql-connector-python-8.0.20.tar.gz
cd ~/tools/mysql-connector-python-8.0.20
python3 setup.py install
```

Install myems-aggregation service:
```bash
cd ~
git clone https://github.com/MyEMS/myems.git
cd myems
git checkout master (or the latest release tag)
cp -R ~/myems/myems-aggregation /myems-aggregation
```
Create .env file based on .env.example and edit the .env file if needed:
```bash
cp /myems-aggregation/.env.example /myems-aggregation/.env
nano /myems-aggregation/.env
```
Setup systemd service:
```bash
cp myems-aggregation.service /lib/systemd/system/
```
Enable the service:
```bash
systemctl enable myems-aggregation.service
```
Start the service:
```bash
systemctl start myems-aggregation.service
```
Monitor the service:
```bash
systemctl status myems-aggregation.service
```
View the log:
```bash
cat /myems-aggregation.log
```

### References

[1]. https://myems.io

[2]. https://dev.mysql.com/doc/connector-python/en/
