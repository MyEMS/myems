# myems-admin

## 简介

系统管理用户界面，用于 MyEMS 系统配置。

## 依赖

nginx-1.18.0 或更高版本


## 安装

### 方式 1：使用 Docker 安装 myems-admin

详见 [myems.cn](https://myems.cn/docs/installation/docker-linux#step-3-myems-admin)

## 方式 2：在 NGINX 服务器上安装

详见 [myems.cn](https://myems.cn/docs/installation/debian-ubuntu#step-3-myems-admin)

## 方式 3：在 Apache2 服务器上安装
* 安装 Apache2 服务器

参考 https://httpd.apache.org/docs/2.4/install.html

* 配置 Apache2
```bash
  sudo vi /etc/apache2/ports.conf
```
添加 Listen：
```
Listen 8001
```
```bash
sudo vi /etc/apache2/sites-available/000-default.conf
```
添加如下 VirtualHost：
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

* 安装 myems-admin：
  若服务器无法连接互联网，请将 myems/myems-admin 目录压缩后上传到服务器，并解压到 ~/myems/myems-admin
```bash
sudo cp -r myems/myems-admin  /var/www/myems-admin
sudo chmod 0755 -R /var/www/myems-admin
```
  检查配置文件，必要时进行修改：
```bash
sudo nano /var/www/myems-admin/app/api.js
```


## 参考资料

[1]. https://myems.cn

[2]. https://dev.mysql.com/doc/connector-python/en/

[3]. https://nginx.org/
