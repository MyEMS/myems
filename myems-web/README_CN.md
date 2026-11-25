# myems-web

## 简介

Web 用户界面，用于 MyEMS 能源数据可视化。

## 依赖

nginx-1.18.0 或更高版本

Node.js 22.22.2、24.5.0 或更高版本

npm 10.9.7、11.5.1 或更高版本


## 本地开发环境运行

* 在 Linux 上通过二进制压缩包安装 Node.js

从 https://nodejs.org/en/download/current/ 下载 Current Linux Binaries (x64)

```bash
sudo mkdir -p /usr/local/lib/nodejs
sudo tar -xJvf node-vxx.x.x-linux-x64.tar.xz -C /usr/local/lib/nodejs
sudo ln -s /usr/local/lib/nodejs/node-vxx.x.x-linux-x64/bin/node /usr/bin/node
sudo ln -s /usr/local/lib/nodejs/node-vxx.x.x-linux-x64/bin/npm /usr/bin/npm
sudo ln -s /usr/local/lib/nodejs/node-vxx.x.x-linux-x64/bin/npx /usr/bin/npx
```
从 https://nodejs.org/en/download/current/ 下载最新 Current 版本的 Windows 安装包（.msi）64 位，
使用安装向导安装 Node.js。

测试安装：
```bash
node -v
npm version
npx -v
```

* 将所有必要依赖下载到 node_modules 目录。
```bash
cd myems/myems-web
npm i
```

* 如果修改了任何 scss 文件，需要编译 SCSS；否则可跳过此步骤。
  取消注释 package.json 第 4 行 `"type": "module",`
  在项目目录执行以下命令编译 scss。
```bash
npm run scss
```
再将 package.json 第 4 行改回注释：`"//type": "module",`


* 启动开发服务器
  本地 Web 服务器会在 http://localhost:3000 启动。
  项目使用 webpack 和 webpack-serve 自动检测文件变更。编辑并保存文件后，浏览器会自动刷新并预览更改。
```bash
npm start
```

## 安装

### 方式 1：使用 Docker 安装 myems-web

详见 [myems.cn](https://myems.cn/docs/installation/docker-linux#step-8-myems-web)

### 方式 2：在带 NGINX 的服务器上安装 myems-web

详见 [myems.cn](https://myems.cn/docs/installation/debian-ubuntu#step-8-myems-web)

### 方式 3：在 Apache2 服务器上安装
* 安装 Apache2 服务器

参考 https://httpd.apache.org/docs/2.4/install.html

* 配置 Apache2
```bash
sudo vi /etc/apache2/ports.conf
```
添加 Listen：
```
Listen 80
```
```bash
sudo vi /etc/apache2/sites-available/000-default.conf
```
添加如下 VirtualHost：
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

* 安装 MyEMS Web UI：

如有需要，检查并修改配置文件：
```bash
cd myems/myems-web
sudo nano src/config.js
```

构建并压缩：
```bash
cd myems/myems-web/
sudo npm run build
tar czvf myems-web.tar.gz build
```

安装：
将 myems-web.tar.gz 上传到 Web 服务器。
注意：下列路径应与 000-default.conf 中的配置一致。
```bash
tar xzf myems-web.tar.gz
sudo rm -r /var/www/myems-web
sudo mv build  /var/www/myems-web
```
* 避免刷新页面时出现 404 错误
```bash
cd /var/www/myems-web
sudo vi .htaccess
```
添加如下 IfModule：
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
配置 rewrite.load
```bash
cd /etc/apache2/mods-enabled/
sudo vi rewrite.load
```
添加如下内容：
```bash
LoadModule rewrite_module /usr/lib/apache2/modules/mod_rewrite.so
```

### 方式 4：在 Node.js Web 服务器上安装 myems-web
* 在项目目录执行以下命令生成生产构建。

这会通过编译、合并、压缩等必要步骤生成优化后的生产构建，并输出到 build/ 目录。
```bash
sudo npm run build
```

* 在 http://localhost:80 本地运行生产构建。
  若要监听其他端口，请修改 myems/myems-web/server.js
```bash
sudo node server.js
```


### 参考资料

[1]. http://myems.cn
