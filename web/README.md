# MyEMS Web

## Introduction
MyEMS Web 用户界面，用于能源数据分析
Providing Web UI for MyEMS users to analysis energy data

## Prerequisites
Node.js

nginx-1.18.0 or later


## Running in Local environment
This project is scaffolded using Create React App.

* Install Node.js (https://nodejs.org/) if you do not already have it installed on your machine.
* Open the “myems-web” directory with your cmd or terminal
* Run 'sudo npm i --unsafe-perm=true --allow-root'
This command will download all the necessary dependencies for falcon in the node_modules directory.
* If you modified any scss files, then you need to compile SCSS
Run 'sudo npm run scss' command in your project directory to compile scss. 
* Run 'sudo npm start'
A local web server will start at http://localhost:3000.
We are using webpack and webpack-serve to automatically detect file changes. So, if you edit and save a file, your browser will automatically refresh and preview the change.

## Creating a Production Build
* Run 'sudo npm run build' command in your project directory to make the Production build.

This will create an optimized production build by compililing, merging and minifying all the source files as necessary and put them in the build/ folder.

You can run 'node server.js' to run the production build locally at http://localhost:5000.

## Install Production Build on NGINX Server

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
      listen                 80;
      server_name     myems-web;
      location / {
          root    /var/www/html/web;
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
Restart NGINX
```
$ sudo systemctl restart nginx
```

* Download myems:
```
  $ cd ~
  $ git clone https://github.com/MyEMS/myems.git
```
* Install myems-web :

  Check and change the config file if necessary:
```
  $ cd ~/myems/web
  $ sudo nano src/config.js
```
  Build and Compress
```
  $ sudo npm run build
  $ tar czvf myems-web.tar.gz build
```
  Install
  Upload the file myems-web.tar.gz to you web server. 
  Note that the following path should be same as that was configured in nginx.conf.
```
  $ tar xzf myems-web.tar.gz
  $ sudo rm -r /var/www/html/web
  $ sudo mv build  /var/www/html/web
```
