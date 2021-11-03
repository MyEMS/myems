# MyEMS Admin

## Introduction
MyEMS 系统管理面板，用于项目配置和系统管理
Providing admin panel  for MyEMS system administration and configuration

## Prerequisites
nginx-1.18.0 or later


## Option 1: Install on Docker

* Install on Docker

```bash
cd admin
docker build -t myems-admin .
docker run -d --restart always myems-admin 
```

## Option 2: Install on NGINX Server

* Install NGINX Server

refer to http://nginx.org/en/docs/install.html

* Configure NGINX
```bash
sudo nano /etc/nginx/nginx.conf
```
In the 'http' section, add some directives:
```
http{
    client_header_timeout 600;
    client_max_body_size 512M;
    gzip on;
    gzip_min_length 512;
    gzip_proxied any;
    gzip_types *;
    gzip_vary on;
    ...

}
```

Add a new 'server' section with direstives as below:
```
  server {
      listen                 8001;
      server_name     myems-admin;
      location / {
          root    /var/www/html/admin;
          index index.html index.htm;
      }
      -- To avoid CORS issue, use Nginx to proxy myems-api to path /api 
      -- Add another location /api in 'server ', replace demo address http://127.0.0.1:8000/ with actual url
      location /api {
          proxy_pass http://127.0.0.1:8000/;
          proxy_connect_timeout 75;
          proxy_read_timeout 600;
          send_timeout 600;
      }
  }
```

* Download myems
```bash
cd ~
git clone https://github.com/MyEMS/myems.git
```

* Install myems-admin :
  If the server can not connect to the internet, please compress the myems/admin folder and upload it to the server and extract it to ~/myems/admin
```bash
sudo cp -r ~/myems/admin  /var/www/html/admin
sudo chmod 0755 -R /var/www/html/admin
```
  Check the config file and change it if necessary:
```bash
sudo nano /var/www/html/admin/app/api.js
```

## NOTE:
The 'upload' folder is for user uploaded files. DO NOT delete/move/overwrite the 'upload' folder when you upgraded myems-admin.
```bash
 /var/www/html/admin/upload
```


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
```xml
<VirtualHost 127.0.0.1:8001>
        ServerAdmin MyEMS-admin
        DocumentRoot /var/www/admin
        
        <Directory "var/www/admin">
                Options FollowSymLinks
                AllowOverride All
                Require all granted
        </Directory>
        ErrorLog ${APACHE_LOG_DIR}/error.log
        CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
```

* Download myems-admin
```bash
cd ~
git clone https://github.com/MyEMS/myems.git
```

* Install myems-admin :
  If the server can not connect to the internet, please compress the myems/admin folder and upload it to the server and extract it to ~/myems/admin
```bash
sudo cp -r ~/myems/admin  /var/www/html/admin
sudo chmod 0755 -R /var/www/html/admin
```
  Check the config file and change it if necessary:
```bash
sudo nano /var/www/html/admin/app/api.js
```