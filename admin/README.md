# MyEMS Admin

## Introduction
MyEMS 系统管理面板，用于项目配置和系统管理
Providing admin panel  for MyEMS system administration and configuration

## Prerequisites
nginx-1.18.0 or later


## Installation

* Install NGINX  Server

refer to http://nginx.org/en/docs/install.html

* Configure NGINX
```
$ sudo nano /etc/nginx/nginx.conf
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

* Download myems-admin
```
$ cd ~
$ git clone https://github.com/MyEMS/myems.git
```

* Install myems-admin :
  If the server can not connect to the internet, please compress the myems/admin folder and upload it to the server and extract it to ~/myems/admin
```
$ sudo cp -r ~/myems/admin  /var/www/html/admin
$ sudo chmod 0755 -R /var/www/html/admin
```
  Check the config file and change it if necessary:
```
$ sudo nano /var/www/html/admin/app/api.js
```

## NOTE:
The 'upload' folder is for user uploaded files. DO NOT delete/move/overwrite the 'upload' folder when you upgraded myems-admin.
```
 /var/www/html/admin/upload
```


## Install Apache2 Server
sudo apt-get install apache2

* Configure Apache2
```
$ sudo vi /etc/apache2/ports.conf
```
add a Listen
```
Listen 8001
```
$ sudo vi /etc/apache2/sites-available/000-default.conf
```
Add a new 'VirtualHost' as below
```
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
```
$ cd ~
$ git clone https://github.com/MyEMS/myems.git
```
Build and Compress
```
$ cd ~/myems/admin/
$ sudo npm run build
$ tar czvf myems-admin.tar.gz build
```
Install Upload the file myems-admin.tar.gz to you admin server. Note that the following path should be same as that was configured in nginx.conf.
```
$ tar xzf myems-admin.tar.gz
$ sudo rm -r /var/www/admin
$ sudo mv build  /var/www/admin
```
Restart Apache2
```
$ sudo service apache2 restart
```