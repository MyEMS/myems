# myems-web

## Introduction

Web用户界面，用于MyEMS能源数据可视化

Web UI for MyEMS energy data visualization

## Dependencies

nginx-1.18.0 or later

Node.js 18.20.0 or later
Npm 8.19.4 or later

**Note:** The 7.x version of `serialize-javascript` utilizes `crypto.getRandomValues` in Node.js 18, but this API may not be properly exposed in certain environments of Node.js 18. If you encounter `ReferenceError: crypto is not defined`, downgrade `serialize-javascript` to version 6.x by modifying the `overrides` section in `package.json`:

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
npm i  
```
