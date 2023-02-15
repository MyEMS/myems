# myems-web

## Introduction

Web用户界面，用于MyEMS能源数据可视化

Web UI for MyEMS energy data visualization

## Dependencies

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

Refer to [myems.io](https://myems.io/docs/installation/docker-linux#step-8-myems-web)

### Option 2: Install myems-web on Server with NGINX

Refer to [myems.io](https://myems.io/docs/installation/debian-ubuntu#step-8-myems-web)

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
<IfModule mod_rewrite.c>
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


### References

[1]. http://myems.io
