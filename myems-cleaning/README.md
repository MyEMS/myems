# myems-cleaning
MyEMS Cleaning Service 

MyEMS 数据清洗服务

### Introduction

This service is a component of MyEMS and it cleans the historical data. 

### Prerequisites

mysql-connector-python

schedule

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

Install myems-cleaning service
```bash
cd ~
git clone https://github.com/MyEMS/myems.git
cd myems
git checkout master (or the latest release tag)
cp -R ~/myems/myems-cleaning /myems-cleaning
```
Create .env file based on .env.example and edit the .env file if needed:
```bash
cp /myems-cleaning/example.env /myems-cleaning/.env
nano /myems-cleaning/.env
```
Setup systemd service:
```bash
cp myems-cleaning.service /lib/systemd/system/
```
Enable the service:
```bash
systemctl enable myems-cleaning.service
```
Start the service:
```bash
systemctl start myems-cleaning.service
```
Monitor the service:
```bash
systemctl status myems-cleaning.service
```
View the log:
```bash
cat /myems-cleaning.log
```

### References

1.  https://myems.io
2.  https://dev.mysql.com/doc/connector-python/en/