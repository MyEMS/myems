## MyEMS Normalization Service 数据规范化服务



### Introduction

This service is a component of MyEMS and it normalizes energy data in historical database.


### Prerequisites

mysql.connector

sympy

openpyxl


### Installation

Download and install MySQL Connector:
```
    $ cd ~/tools
    $ wget https://dev.mysql.com/get/Downloads/Connector-Python/mysql-connector-python-8.0.20.tar.gz
    $ tar xzf mysql-connector-python-8.0.20.tar.gz
    $ cd ~/tools/mysql-connector-python-8.0.20
    $ sudo python3 setup.py install
```

Download and install mpmath
```
   $ cd ~/tools
   $ git clone https://github.com/fredrik-johansson/mpmath.git
   $ cd ~/tools/mpmath
   $ sudo python3 setup.py install
```

Download and install SymPy
```
    $ cd ~/tools
    $ git clone https://github.com/sympy/sympy.git
    $ cd ~/tools/sympy
    $ sudo python3 setupegg.py develop
```

Download and install openpyxl
```
    $ cd ~/tools

    Get the latest version of et_xmlfile from https://bitbucket.org/openpyxl/et_xmlfile/downloads/
    $ wget https://bitbucket.org/openpyxl/et_xmlfile/get/50973a6de49c.zip
    $  7z x 50973a6de49c.zip && mv openpyxl-et_xmlfile-50973a6de49c et_xmlfile

    $ git clone https://github.com/phn/jdcal.git

    Get the latest version of openpyxl from https://bitbucket.org/openpyxl/openpyxl/downloads/
    $ wget https://bitbucket.org/openpyxl/openpyxl/get/8953233f5af2.zip
    $ 7z x 8953233f5af2.zip && mv openpyxl-openpyxl-8953233f5af2 openpyxl

    $ cd ~/tools/et_xmlfile
    $ sudo python3 setup.py install
    $ cd ~/tools/jdcal
    $ sudo python3 setup.py install
    $ cd ~/tools/openpyxl
    $ sudo python3 setup.py install
```

Install myems-normalization service:
```
    $ cd ~
    $ git clone https://github.com/MyEMS/myems.git
    $ cd myems
    $ sudo git checkout master (or the latest release tag)
    $ sudo cp -r ~/myems/myems-normalization /myems-normalization
```

    Edit config.py for your project
```
    $ sudo nano /myems-normalization/config.py
```

    Setup systemd service:
```
    $ sudo cp myems-normalization.service /lib/systemd/system/
```

    Enable the service:
```
    $ sudo systemctl enable feed-normalization.service
```

    Start the service:
```
    $ sudo systemctl start feed-normalization.service
```

### References

1. https://myems.io
2. https://dev.mysql.com/doc/connector-python/en/
3. https://github.com/sympy/sympy
4. https://openpyxl.readthedocs.io
