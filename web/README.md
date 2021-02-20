# MyEMS Web

## Introduction
MyEMS Web 用户界面，用于能源数据分析
Providing Web UI for MyEMS users to analysis energy data

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/d65a896c59f34eadb5c90c8e1abc22ce)](https://app.codacy.com/gh/myems/myems-web?utm_source=github.com&utm_medium=referral&utm_content=myems/myems-web&utm_campaign=Badge_Grade)
[![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/myems/myems-web/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/myems/myems-web/?branch=master)
[![Maintainability](https://api.codeclimate.com/v1/badges/390e65ff77c25d1a5a05/maintainability)](https://codeclimate.com/github/myems/myems-web/maintainability)
[![Total alerts](https://img.shields.io/lgtm/alerts/g/myems/myems-web.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/myems/myems-web/alerts/)

## Prerequisites
Node.js

nginx-1.18.0 or later


## Running in Local environment
This project is scaffolded using Create React App.

* Install Node.js (https://nodejs.org/) if you do not already have it installed on your machine.
* Open the “myems-web” directory with your cmd or terminal
* Run 'npm i'
This command will download all the necessary dependencies for falcon in the node_modules directory.
* Run 'npm start'
A local web server will start at http://localhost:3000.
We are using webpack and webpack-serve to automatically detect file changes. So, if you edit and save a file, your browser will automatically refresh and preview the change.

## Creating a Production Build
* Run 'npm run build' command in your project directory to make the Production build.

This will create an optimized production build by compililing, merging and minifying all the source files as necessary and put them in the build/ folder.

You can run 'node server.js' to run the production build locally at http://localhost:5000.

## Install Production Build on NGINX Server

* Install NGINX  Server

refer to http://nginx.org/en/docs/install.html

* Install myems-web :

  Check and change the config file if necessary:
```
  $ cd ~/myems-web
  $ sudo nano src/config.js
```
  Build and Compress
```
  $ sudo npm run build
  $ tar czvf myems-web.tar.gz build
```
  Install
  Upload the file myems-web.tar.gz to you web server. 
  Note that the following path may be different in your server.
```
  $ tar xzf myems-web.tar.gz
  $ sudo rm -r /var/www/html/web
  $ sudo mv build  /var/www/html/web
```
