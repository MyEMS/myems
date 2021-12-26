## Docker Compose
除了分步安装方式，也可以使用docker-compose命令一键安装

### 前提

- 主机已安装docker、docker-compose、npm
- MySQL数据库已安装，拥有一个账号为root，密码为!MyEMS1的用户
- MySQL数据库可正常登陆，可被安装Docker的主机Ping通以及远程访问

### 配置

注一：这里的主机指的是**安装Docker的主机**, 这里的IP和账号密码都为假定的，用来展示说明，实际情况中用户需要根据自己的配置改为自己的，具体的修改步骤会在“安装”中讲述。

注二：这里如果**安装数据库和安装Docker的主机为同一个主机，那么数据库IP和主机IP修改为一个实际IP**即可，这里是以数据库，和安装Docker的主机不在同一个上举例的。

| --         | --          |
| ---------- | ----------- |
| 主机IP     | 192.168.0.1 |
| 数据库IP   | 192.168.0.2 |
| 数据库账号 | root        |
| 数据库密码 | !MyEMS1        |

### 安装

1.  克隆仓库
```
git clone https://gitee.com/myems/myems.git 
```

2.  导入数据库结构

```
cd myems/database/install
mysql -u root -p < myems_billing_baseline_db.sql
mysql -u root -p < myems_billing_db.sql
mysql -u root -p < myems_energy_baseline_db.sql
mysql -u root -p < myems_energy_db.sql
mysql -u root -p < myems_fdd_db.sql
mysql -u root -p < myems_historical_db.sql
mysql -u root -p < myems_reporting_db.sql
mysql -u root -p < myems_system_db.sql
mysql -u root -p < myems_user_db.sql
```
注： 详情可查看[database/README.md](./database/README.md)


3.  修改配置

注：如“配置”所述，这里假定的**主机IP为 192.168.0.1，数据库IP为 192.168.0.2，数据库账号为：root,数据库密码:!MyEMS1,用户应该修改为自己对应的主机IP,数据库IP,数据库账号，数据库密码**

3.1  修改nginx.conf里的API配置
```
cd myems
sed -i 's/127.0.0.1:8000/192.168.0.1:8000/g' admin/nginx.conf
sed -i 's/127.0.0.1:8000/192.168.0.1:8000/g' web/nginx.conf
```

3.2  复制example.env为.env并修改.env里的数据库IP，账号，密码
```
# 这里以修改数据库IP为例，如果数据库账号密码也不同，请根据自己需求替换.env里的账号密码
cd myems
cp myems-api/example.env myems-api/.env
sed -i 's/127.0.0.1/192.168.0.2/g' myems-api/.env
cp myems-aggregation/example.env myems-aggregation/.env
sed -i 's/127.0.0.1/192.168.0.2/g' myems-aggregation/.env
cp myems-cleaning/example.env myems-cleaning/.env
sed -i 's/127.0.0.1/192.168.0.2/g' myems-cleaning/.env
cp myems-modbus-tcp/example.env myems-modbus-tcp/.env
sed -i 's/127.0.0.1/192.168.0.2/g' myems-modbus-tcp/.env
cp myems-normalization/example.env myems-normalization/.env
sed -i 's/127.0.0.1/192.168.0.2/g' myems-normalization/.env 
```

3.3 修改docker-compose.yml中upload文件夹
如果是Windows主机，在api和admin服务中，volumes/source使用 c:\upload
如果是Linux主机，在api和admin服务中，volumes/source使用 /upload
应确保api和admin共享同一主机文件夹。

3.4  验证数据库连接
```
cd myems
python3 myems-api/test_mysql.py
```

4.  编译Web UI

```
cd myems/web
npm i --unsafe-perm=true --allow-root --legacy-peer-deps
npm run build
```

5. 运行docker-compose命令

```
cd myems
docker-compose up -d 
```

6. 验证

|       | 网址                    | 结果             |
| ----- | ----------------------- | ---------------- |
| web   | 192.168.0.1:80          | 输入账号密码登录成功 |
| admin | 192.168.0.1:8001        | 输入账号密码登录成功 |
| api   | 192.168.0.1:8000/version| 返回版本信息       |
注：如果api报错，请确认.env里的数据库IP，数据库账号，数据库密码是否正确，如果不正确，请修改.env后执行：
```
docker-compose up --build -d
```
