# myems-admin

## Introduction

系统管理用户界面，用于MyEMS系统配置

Admin UI for MyEMS system settings

## Prerequisites

nginx-1.18.0 or later


## Installation

### Option 1: Install myems-admin on Docker

Refer to [myems.io](https://myems.io/docs/installation/docker-linux#step-3-myems-admin)

## Option 2: Install on NGINX Server

Refer to [myems.io](https://myems.io/docs/installation/debian-ubuntu#step-3-myems-admin)

## Option 3: Install on Apache2 Server
* Install Apache2 Server

refer to https://httpd.apache.org/docs/2.4/install.html

* Configure Apache2
```bash
  sudo vi /etc/apache2/ports.conf
```
Add a Listen
```
Listen 8001
```
```bash
sudo vi /etc/apache2/sites-available/000-default.conf
```
Add a new 'VirtualHost' as below
```
<VirtualHost 127.0.0.1:8001>
        ServerAdmin MyEMS-admin
        DocumentRoot /var/www/myems-admin
        
        <Directory "var/www/myems-admin">
                Options FollowSymLinks
                AllowOverride All
                Require all granted
    			Header set Access-Control-Allow-Origin *
        </Directory>
        ErrorLog ${APACHE_LOG_DIR}/error.log
        CustomLog ${APACHE_LOG_DIR}/access.log combined
        ProxyRequests Off
		ProxyPreserveHost On
		
		<Proxy *>
			Order Deny,Allow
			Allow from all
		</Proxy>
		ProxyPass /api http://127.0.0.1:8000/
		ProxyPassReverse /api http://127.0.0.1:8000/
</VirtualHost>
```

* Install myems-admin :
  If the server can not connect to the internet, please compress the myems/myems-admin folder and upload it to the server and extract it to ~/myems/myems-admin
```bash
sudo cp -r myems/myems-admin  /var/www/myems-admin
sudo chmod 0755 -R /var/www/myems-admin
```
  Check the config file and change it if necessary:
```bash
sudo nano /var/www/myems-admin/app/api.js
```


## References

[1]. https://myems.io

[2]. https://dev.mysql.com/doc/connector-python/en/ 

[3]. https://nginx.org/