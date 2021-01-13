Installation
===================

MyEMS API Service
--------------------

Introduction
++++++++++++++++

Providing REST API service for MyEMS Web APP, Android APP and iOS APPand/or third parties

Prerequisites
+++++++++++++++
| anytree
| simplejson
| mysql.connector
| falcon
| falcon_cors
| gunicorn
| openpyxl

Installation
+++++++++++++++++

* Install anytree::

    $ cd ~/tools
    $ git clone https://github.com/c0fec0de/anytree.git
    $ cd anytree
    $ sudo python3 setup.py install

* Install simplejson::

    $ cd ~/tools
    $ git clone https://github.com/simplejson/simplejson.git
    $ cd simplejson
    $ sudo python3 setup.py install

* Install MySQL Connector::

    $ cd ~/tools
    $ wget https://dev.mysql.com/get/Downloads/Connector-Python/mysql-connector-python-8.0.20.tar.gz
    $ tar xzf mysql-connector-python-8.0.20.tar.gz
    $ cd ~/tools/mysql-connector-python-8.0.20
    $ sudo python3 setup.py install

* Install Falcon

  | if you are behind proxy, use --proxy parameter
  | Refer to
  | `https://falconframework.org/ <https://falconframework.org/>`_
  | `https://github.com/lwcolton/falcon-cors <https://github.com/lwcolton/falcon-cors>`_
  | `https://github.com/yohanboniface/falcon-multipart <https://github.com/yohanboniface/falcon-multipart>`_
  ::

    $ mkdir ~/tools/falcon && cd ~/tools/falcon
    $ pip3 download cython falcon falcon-cors falcon-multipart
    $ export LC_ALL="en_US.UTF-8"
    $ export LC_CTYPE="en_US.UTF-8"
    $ sudo dpkg-reconfigure locales
    $ sudo pip3 install --upgrade --no-index --find-links ~/tools/falcon cython falcon falcon-cors falcon-multipart

* Install gunicorn, refer to `http://gunicorn.org <http://gunicorn.org>`_::

    $ mkdir ~/tools/gunicorn && cd ~/tools/gunicorn
    $ pip3 download gunicorn
    $ sudo pip3 install --no-index --find-links ~/tools/gunicorn gunicorn

* Install openpyxl, refer to `https://foss.heptapod.net/openpyxl/openpyxl <https://foss.heptapod.net/openpyxl/openpyxl>`_

  | Get the latest version of et_xmlfile from `https://bitbucket.org/openpyxl/et_xmlfile/downloads/ <https://bitbucket.org/openpyxl/et_xmlfile/downloads/>`_
  | Get the latest version of jdcal from `https://github.com/phn/jdcal <https://github.com/phn/jdcal>`_
  | Get the latest version of openpyxl from `https://bitbucket.org/openpyxl/openpyxl/downloads/ <https://bitbucket.org/openpyxl/openpyxl/downloads/>`_
  ::

    $ cd ~/tools
    $ wget https://foss.heptapod.net/openpyxl/et_xmlfile/-/archive/branch/default/et_xmlfile-branch-default.zip
    $ 7z x et_xmlfile-branch-default.zip
    $ cd ~/tools/et_xmlfile-branch-default
    $ sudo python3 setup.py install
    $ cd ~/tools
    $ git clone https://github.com/phn/jdcal.git
    $ cd ~/tools/jdcal
    $ sudo python3 setup.py install
    $ cd ~/tools
    $ wget https://foss.heptapod.net/openpyxl/openpyxl/-/archive/branch/3.0/openpyxl-branch-3.0.zip
    $ 7z x openpyxl-branch-3.0.zip
    $ cd ~/tools/openpyxl-branch-3.0
    $ sudo python3 setup.py install

* Install gunicorn service for myems-api::

    $ cd ~/myems-api
    $ sudo cp -R ~/myems-api /myems-api

  Check and change the config file if necessary::

    $ sudo nano /myems-api/config.py

  Change the listening port (8080 as an example) in gunicorn.socket::

    $ sudo nano /myems-api/gunicorn.socket
    ListenStream=0.0.0.0:8080
    $ sudo ufw allow 8080

  Setup systemd configure files::

    $ sudo cp /myems-api/gunicorn.service /lib/systemd/system/
    $ sudo cp /myems-api/gunicorn.socket /lib/systemd/system/
    $ sudo cp /myems-api/gunicorn.conf /usr/lib/tmpfiles.d/

  Next enable the services so they autostart at boot::

    $ sudo systemctl enable gunicorn.socket
    $ sudo systemctl enable gunicorn.service

  Start the services::

    $ sudo systemctl start gunicorn.socket
    $ sudo systemctl start gunicorn.service

  **Run for debugging and testing**::

    $ cd myems-api
    $ sudo gunicorn -b 127.0.0.1:8080 app:api

