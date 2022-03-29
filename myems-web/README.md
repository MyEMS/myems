# myems-web

## Introduction
Web用户界面，用于MyEMS能源数据可视化
Web UI for MyEMS energy data visualization

## Prerequisites

nginx-1.18.0 or later

Node.js 17.0.0 or later

## Running in Local Environment for Development

* Install Node.js via binary archive on Linux
Download Current Linux Binaries (x64) from https://nodejs.org/en/download/current/

```bash
sudo mkdir -p /usr/local/lib/nodejs
sudo tar -xJvf node-vxx.x.x-linux-x64.tar.xz -C /usr/local/lib/nodejs 
sudo ln -s /usr/local/lib/nodejs/node-vxx.x.x-linux-x64/bin/node /usr/bin/node
sudo ln -s /usr/local/lib/nodejs/node-vxx.x.x-linux-x64/bin/npm /usr/bin/npm
sudo ln -s /usr/local/lib/nodejs/node-vxx.x.x-linux-x64/bin/npx /usr/bin/npx
```
Download the latest current version Windows installer (.msi) 64-bit from https://nodejs.org/en/download/current/
Install Node.js with Setup Wizard


Test installation
```bash
node -v
npm version
npx -v
```

* Download all the necessary dependencies into the node_modules directory.
```bash
cd myems/myems-web
npm i --unsafe-perm=true --allow-root --legacy-peer-deps
```

* If you modified any scss files then you need to compile SCSS, else you can safely ignore this step.
Run below command in your project directory to compile scss.
```bash
npm run scss
```

* Starting the Development Server
A local web server will start at http://localhost:3000.
We are using webpack and webpack-serve to automatically detect file changes. So, if you edit and save a file, your browser will automatically refresh and preview the change.
```bash
npm start
```

## Installation

### Option 1: Install myems-web on Docker

In this section, you will install myems-web on Docker.

* Check and change the config file if necessary:

```bash
cd myems/myems-web
nano src/config.js
```

* Replace ~~127.0.0.1:8000~~ in nginx.conf with real **HOST** ip and port of myems-api
```bash
cd myems/myems-web
nano nginx.conf
```

* Build a Docker image

**NOTE**: You can safely ignore the command 'npm run build' in this section, because it is built into the Dockerfile

On Windows:
```bash
cp -r myems/myems-web c:\myems-web
cd c:\myems-web
docker build -t myems/myems-web .
```

On Linux:
```bash
cp -r myems/myems-web /myems-web
cd /myems-web
docker build -t myems/myems-web .
```

* Run a Docker container
If run on Windows host, bind-mount nginx.conf to the container
```bash
docker run -d -p 80:80 -v c:\myems-web/nginx.conf:/etc/nginx/nginx.conf --restart always --name myems-web myems/myems-web
```
If run on Linux host, bind-mount nginx.conf 
```bash
docker run -d -p 80:80 -v /myems-web/nginx.conf:/etc/nginx/nginx.conf --restart always --name myems-web myems/myems-web
```

-d Run container in background and print container ID

-p Publish a container's port(s) to the host, 80:80 (Host:Container) binds port 80 (right)  of the container to TCP port 80 (left) of the host machine.

--restart Restart policy to apply when a container exits

--name Assign a name to the container

If you want to immigrate the image to another computer,
* Export image to tarball file
```bash
docker save --output myems-web.tar myems/myems-web
```
* Copy the tarball file to another computer, and then load image from tarball file
```bash
docker load --input .\myems-web.tar
```

### Option 2: Install myems-web on Server with NGINX

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

Add a new 'server' section with directives as below:
```
  server {
      listen                 80;
      server_name     myems-web;
      location / {
          root    /var/www/myems-web;
          index index.html index.htm;
          # add try_files directive to avoid 404 error while refreshing pages
          try_files $uri  /index.html;
      }
      ## To avoid CORS issue, use Nginx to proxy myems-api to path /api 
      ## Add another location /api in 'server' and replace demo address http://127.0.0.1:8000/ with actual url
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

* Install MyEMS Web UI:

Check and change the config file if necessary:
```bash
cd myems/myems-web
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
sudo rm -r /var/www/myems-web
sudo mv build  /var/www/myems-web
```

### Option 3: Install on Apache2 Server
* Install Apache2 Server

refer to https://httpd.apache.org/docs/2.4/install.html

* Configure Apache2
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
        DocumentRoot /var/www/myems-web
        
        <Directory "var/www/myems-web">
                Options FollowSymLinks
                AllowOverride All
                Require all granted
        </Directory>
        ErrorLog ${APACHE_LOG_DIR}/error.log
        CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
```

* Install MyEMS Web UI:

Check and change the config file if necessary:
```bash
cd myems/myems-web
sudo nano src/config.js
```

Build and Compress
```bash
cd myems/myems-web/
sudo npm run build
tar czvf myems-web.tar.gz build
```

Install 
Upload the file myems-web.tar.gz to you web server. 
Note that the following path should be same as that was configured in 000-default.conf
```bash
tar xzf myems-web.tar.gz
sudo rm -r /var/www/myems-web
sudo mv build  /var/www/myems-web
```
*   avoid 404 error while refreshing pages
```bash
cd /var/www/myems-web
sudo vi .htaccess
```
  Add a IfModule as below:
```bash
IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```
  Configure rewrite.load
```bash
cd /etc/apache2/mods-enabled/
sudo vi rewrite.load
```
  Add content as below
```bash
LoadModule rewrite_module /usr/lib/apache2/modules/mod_rewrite.so
```

### Option 4: Install myems-web on Node.js Web Server
* Run below command in your project directory to make the Production build.

This will create an optimized production build by compiling, merging and minifying all the source files as necessary and put them in the build/ folder.
```bash
sudo npm run build
```

* Run the production build locally at http://localhost:80.
    If you want to listen on other port, change it in myems/myems-web/server.js
```bash
sudo node server.js
```