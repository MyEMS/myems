## MyEMS Normalization Service 数据规范化服务

### Introduction

This service is a component of MyEMS and it normalizes energy data in historical database.

![MyEMS Meter Normalization](../docs/images/meter-normalization.png)

### Prerequisites

mysql-connector-python

openpyxl

sympy

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

Download and install mpmath
```bash
cd ~/tools
git clone https://github.com/fredrik-johansson/mpmath.git
cd ~/tools/mpmath
python3 setup.py install
```

Download and install SymPy
```bash
cd ~/tools
git clone https://github.com/sympy/sympy.git
cd ~/tools/sympy
python3 setupegg.py develop
```

Download and install openpyxl
```bash
cd ~/tools
```
Get the latest version of et_xmlfile from https://foss.heptapod.net/openpyxl/et_xmlfile/
```bash
wget https://foss.heptapod.net/openpyxl/et_xmlfile/-/archive/1.1/et_xmlfile-1.1.tar.gz
tar xzf et_xmlfile-1.1.tar.gz
```
Get jdcal
```bash
git clone https://github.com/phn/jdcal.git
```
Get the latest version of openpyxl from https://foss.heptapod.net/openpyxl/openpyxl
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

Install myems-normalization service:
```
cd ~
git clone https://github.com/MyEMS/myems.git
cd myems
git checkout master (or the latest release tag)
cp -r ~/myems/myems-normalization /myems-normalization
```
Create .env file based on .env.example and edit the .env file if needed:
```bash
cp /myems-normalization/.env.example /myems-cleaning/.env
nano /myems-normalization/.env
```
Setup systemd service:
```
cp myems-normalization.service /lib/systemd/system/
```
Enable the service:
```
systemctl enable myems-normalization.service
```
Start the service:
```
systemctl start myems-normalization.service
```
Monitor the service:
```bash
systemctl status myems-normalization.service
```
View the log:
```bash
cat /myems-normalization.log
```

### References

1.  https://myems.io
2.  https://dev.mysql.com/doc/connector-python/en/
3.  https://github.com/sympy/sympy
4.  https://openpyxl.readthedocs.io
