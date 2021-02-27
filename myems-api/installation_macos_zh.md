# 安装部署

## macOS（v11.2.1）

#### 1.Python

MyEMS要求Python版本在3.5+，这里用brew来安装最新别的`Python3.9`版本,不过要先安装`Xcode Command Line Tools`，否则安装python会报错。
```bash
$ xcode-select --install
```
然后安装python3

```shell
$ brew search python3 //默认安装最新版3.9
$ python3 -V
Python 3.9.1 //安装Python3 OK
```
国内网络可能会出现安装慢的问题，配置下国内的资源镜像
```shell
$echo 'export HOMEBREW_BOTTLE_DOMAIN=https://mirrors.aliyun.com/homebrew/homebrew-bottles' >> ~/.zshrc
$source ~/.zshrc
```

#### 2.MySQL

MyEMS默认使用MySQL8.0，也是采用brew来安装
```shell
$ brew install mysql
$ mysql_secure_installation //初始化设置mysql root密码以及外部IP是否允许访问
$ brew services start mysql //启动mysql服务

$ mysql -u root -p密码
mysql: [Warning] Using a password on the command line interface can be insecure.
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 8
Server version: 8.0.23 Homebrew

Copyright (c) 2000, 2021, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql>
```
然后初始化数据库，克隆[myems-database](https://github.com/myems/myems-database)到本地。
```shell
$ git clone https://github.com/myems/myems-database.git
$ cd myems-database
$ mysql -u root -p密码 //用root登录mysql
mysql>
source myems_billing_baseline_db.sql
source myems_billing_db.sql
source myems_energy_baseline_db.sql
source myems_energy_db.sql
source myems_fdd_db.sql
source myems_historical_db.sql
source myems_reporting_db.sql
source myems_system_db.sql
source myems_user_db.sql

mysql> show databases;  // 查看数据库是否导入OK
+---------------------------+
| Database                  |
+---------------------------+
| information_schema        |
| myems_billing_baseline_db |
| myems_billing_db          |
| myems_energy_baseline_db  |
| myems_energy_db           |
| myems_fdd_db              |
| myems_historical_db       |
| myems_reporting_db        |
| myems_system_db           |
| myems_user_db             |
| mysql                     |
| performance_schema        |
| sys                       |
+---------------------------+
13 rows in set (0.02 sec)
```

#### 3.部署mymes-api服务
安装一堆python依赖库
```shell
# 安装anytree
$ cd ~/tools
$ git clone https://github.com/c0fec0de/anytree.git
$ cd anytree
$ sudo python3 setup.py install 


# 安装simplejson
$ pip3 install simplejson

# 安装mysql-connector-python
$ cd ~/tools
$ wget https://dev.mysql.com/get/Downloads/Connector-Python/mysql-connector-python-8.0.20.tar.gz
$ tar xzf mysql-connector-python-8.0.20.tar.gz
$ cd ~/tools/mysql-connector-python-8.0.20
$ sudo python3 setup.py install

# 安装Falcon
$ mkdir ~/tools/falcon && cd ~/tools/falcon
$ pip3 install -i https://pypi.doubanio.com/simple/ cython falcon falcon-cors falcon-multipart  //-i参数加入国内代理速度会快一些

# 安装gunicorn
$ pip3 install -i https://pypi.doubanio.com/simple/  gunicorn

# 安装其它组件
$ cd ~/tools  
$ wget https://foss.heptapod.net/openpyxl/et_xmlfile/-/archive/branch/default/et_xmlfile-branch-default.tar.gz
$ tar xzf et_xmlfile-branch-default.tar.gz
$ cd ~/tools/et_xmlfile-branch-default
$ sudo python3 setup.py install

$ pip3 -i https://pypi.doubanio.com/simple/ install  jdcal Pillow


$ cd ~/tools
$ wget https://foss.heptapod.net/openpyxl/openpyxl/-/archive/branch/3.0/openpyxl-branch-3.0.tar.gz
$ tar xzf openpyxl-branch-3.0.tar.gz
$ cd openpyxl-branch-3.0
$ sudo python3 setup.py install
```

如果安装完整命令行还是提示找不到，就在`.zshrc`种配置下`$PATH`
```shell
$ vim ~/.zshrc
export PATH="/usr/local/Cellar/python@3.9/3.9.1_8/Frameworks/Python.framework/Versions/3.9/bin:$PATH
$ source ~/.zshrc
```

#### 4.运行myems-api服务
```shell
$ git clone https://github.com/kuuyee/myems-api.git
$ cd myems-api
$ gunicorn -b 127.0.0.1:8000 app:api
[2021-02-16 22:21:46 +0800] [3252] [INFO] Starting gunicorn 20.0.4
[2021-02-16 22:21:46 +0800] [3252] [INFO] Listening at: http://127.0.0.1:8000 (3252)
[2021-02-16 22:21:46 +0800] [3252] [INFO] Using worker: sync
[2021-02-16 22:21:46 +0800] [3253] [INFO] Booting worker with pid: 3253

//启动成功
```

#### 5.验证myems-api服务

打开浏览器访问[http://localhost:8000/version](http://localhost:8000/version) 
如果看到如下输出就表示服务启动正常。
```json
{
"version": "MyEMS 1.0.3 (Community Edition)",
"release-date": "20210215",
"website": "https://myems.io"
}
```