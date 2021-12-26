## Docker Compose
Create and start all the services with a single command 

### Prerequisite

- Installed docker、docker-compose、npm on a host.
- Installed MySQL database with username 'root' and password '!MyEMS1'.
- The MySQL database can be connected from the host where Docker is installed.

### Configuration

Note 1: 这里的主机指的是**安装Docker的主机**, 这里的IP和账号密码都为假定的，用来展示说明，实际情况中用户需要根据自己的配置改为自己的，具体的修改步骤会在“安装”中讲述。

Note 2: 这里如果**安装数据库和安装Docker的主机为同一个主机，那么数据库IP和主机IP修改为一个实际IP**即可，这里是以数据库，和安装Docker的主机不在同一个上举例的。

| --         | --          |
| ---------- | ----------- |
| Host IP     | 192.168.0.1 |
| Database IP   | 192.168.0.2 |
| Database User | root        |
| Database Password | !MyEMS1        |

### Installation

1.  Clone repository
```
git clone https://gitee.com/myems/myems.git 
```

2.  Import database schema

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
Note: Refer to [database/README.md](./database/README.md)


3.  Modify Config

注：如“配置”所述，这里假定的**主机IP为 192.168.0.1，数据库IP为 192.168.0.2，数据库账号为：root,数据库密码:!MyEMS1,用户应该修改为自己对应的主机IP,数据库IP,数据库账号，数据库密码**

3.1  Modify api address in nginx.conf
```
cd myems
sed -i 's/127.0.0.1:8000/192.168.0.1:8000/g' admin/nginx.conf
sed -i 's/127.0.0.1:8000/192.168.0.1:8000/g' web/nginx.conf
```

3.2  Copy example.env to .env and modify database IP, username and password in .env
```
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

3.3 Modify upload folder in docker-compose.yml
If Windows host, use c:\upload for volumes/source in api and admin services.
If Linux host, use /upload for volumes/source in api and admin services.
Make sure the upload folders in api and admin are same folder on host.

3.4  Validate database connection
```
cd myems
python3 myems-api/test_mysql.py
```

4.  Build Web UI

```
cd myems/web
npm i --unsafe-perm=true --allow-root --legacy-peer-deps
npm run build
```

5. Run docker-compose command

```
cd myems
docker-compose up -d 
```

6. Verification

|       | Address                 | Result             |
| ----- | ----------------------- | ---------------- |
| web   | 192.168.0.1:80          | 输入账号密码登录成功 |
| admin | 192.168.0.1:8001        | 输入账号密码登录成功 |
| api   | 192.168.0.1:8000/version| 返回版本信息       |
注：如果api报错，请确认.env里的数据库IP，数据库账号，数据库密码是否正确，如果不正确，请修改.env后执行：
```
docker-compose up --build -d
```
