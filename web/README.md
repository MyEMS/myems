# MyEMS Web

## Introduction
MyEMS Web 用户界面，用于能源数据分析
Providing Web UI for MyEMS users to analysis energy data

## Prerequisites
Node.js

nginx-1.18.0 or later

## Running in Local environment
This project is scaffolded using Create React App.

*   Install Node.js via binary archive on Linux
Download Current Linux Binaries (x64) from https://nodejs.org/en/download/current/

Unzip the binary archive to /usr/local/bin/nodejs, 
```bash
sudo mkdir -p /usr/local/lib/nodejs
sudo tar -xJvf node-v1x.x.x-linux-x64.tar.xz -C /usr/local/lib/nodejs 
```
Using sudo to symlink node, npm, and npx into /usr/bin/:
```bash
sudo ln -s /usr/local/lib/nodejs/node-v1x.x.x-linux-x64/bin/node /usr/bin/node
```
```bash
sudo ln -s /usr/local/lib/nodejs/node-v1x.x.x-linux-x64/bin/npm /usr/bin/npm
```
```bash
sudo ln -s /usr/local/lib/nodejs/node-v1x.x.x-linux-x64/bin/npx /usr/bin/npx
```
Test installation using
```bash
node -v
```
```bash
npm version
```
```bash
npx -v
```

*   Open the “myems/web” directory with your cmd or terminal
```bash
cd myems/web
sudo npm i --unsafe-perm=true --allow-root
```

This command will download all the necessary dependencies for falcon in the node_modules directory.
*   If you modified any scss files, then you need to compile SCSS
Run below command in your project directory to compile scss.
```bash
sudo npm run scss
``` 
*   Run 'sudo npm start'
A local web server will start at http://localhost:3000.
We are using webpack and webpack-serve to automatically detect file changes. So, if you edit and save a file, your browser will automatically refresh and preview the change.

## Creating a Production Build
*   Run below command in your project directory to make the Production build.
```bash
sudo npm run build
```

This will create an optimized production build by compililing, merging and minifying all the source files as necessary and put them in the build/ folder.

You can run 'node server.js' to run the production build locally at http://localhost:5000.

## Option 1: Install Production Build on NGINX Server

*   Install NGINX  Server

refer to http://nginx.org/en/docs/install.html

*   Configure NGINX
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
```bash
sudo systemctl restart nginx
```

*   Download myems:
```bash
cd ~
git clone https://github.com/MyEMS/myems.git
```
*   Install myems-web :

  Check and change the config file if necessary:
```bash
cd ~/myems/web
sudo nano src/config.js
```
  Build and Compress
```bash
sudo npm run build
tar czvf myems-web.tar.gz build
```
  Install
  Upload the file myems-web.tar.gz to you web server. 
  Note that the following path should be same as that was configured in nginx.conf.
```bash
tar xzf myems-web.tar.gz
sudo rm -r /var/www/html/web
sudo mv build  /var/www/html/web
```

## Option 2: Install Production Build on Apache2 Server
*   Install Apache2 Server

refer to https://httpd.apache.org/docs/2.4/install.html

*   Configure Apache2
```bash
sudo vi /etc/apache2/ports.conf
```
Add a Listen
```
Listen 80
```
```bash
sudo vi /etc/apache2/sites-available/000-default.conf
```
Add a new 'VirtualHost' as below
```
<VirtualHost 127.0.0.1:80>
        ServerAdmin MyEMS-web
        DocumentRoot /var/www/web
        
        <Directory "var/www/web">
                Options FollowSymLinks
                AllowOverride All
                Require all granted
        </Directory>
        ErrorLog ${APACHE_LOG_DIR}/error.log
        CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
```

*   Download myems:
```bash
cd ~
git clone https://github.com/MyEMS/myems.git
```
*   Install myems-web :

  Check and change the config file if necessary:
```bash
cd ~/myems/web
sudo nano src/config.js
```
  Build and Compress
```bash
cd ~/myems/web/
sudo npm run build
tar czvf myems-web.tar.gz build
```
  Install 
  Upload the file myems-web.tar.gz to you web server. 
  Note that the following path should be same as that was configured in 000-default.conf
```bash
tar xzf myems-web.tar.gz
sudo rm -r /var/www/web
sudo mv build  /var/www/web
```