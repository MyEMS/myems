## Docker Compose
除了分步安装方式，也可以使用docker-compose命令一键安装

### 前提

- 主机已安装docker、docker-compose、npm
- MySQL数据库已安装，拥有一个账号为root，密码为!MyEMS1的用户
- MySQL数据库可正常登陆，可被安装Docker的主机Ping通以及远程访问

### 配置

**注**：这里的主机指的是安装Docker的主机, 这里的IP和账号密码都为假定的，用来展示说明，请酌情修改。

| --                | --          |
| ----------        | ----------- |
| Host IP           | 192.168.0.1 |
| Database IP       | 192.168.0.2 |
| Database User     | root        |
| Database Password | !MyEMS1     |

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
mysql -u root -p < myems_carbon_db.sql
mysql -u root -p < myems_energy_baseline_db.sql
mysql -u root -p < myems_energy_db.sql
mysql -u root -p < myems_energy_model_db.sql
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
cd myems
cp myems-aggregation/example.env myems-aggregation/.env
sed -i 's/127.0.0.1/192.168.0.2/g' myems-aggregation/.env
cp myems-api/example.env myems-api/.env
sed -i 's/127.0.0.1/192.168.0.2/g' myems-api/.env
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

4.  编译Web UI

```
cd myems/web
npm i --unsafe-perm=true --allow-root --legacy-peer-deps
npm run build
```

5. 运行docker-compose命令

On Windows Host:
```
cd myems
docker-compose -f docker-compose-on-windows.yml up -d 
```

On Linux Host:

```
cd myems
docker-compose -f docker-compose-on-linux.yml up -d 
```

6. 验证

|       | 网址                    | 期望结果           |
| ----- | ----------------------- | ---------------- |
| web   | 192.168.0.1:80          | 输入账号密码登录成功 |
| admin | 192.168.0.1:8001        | 输入账号密码登录成功 |
| api   | 192.168.0.1:8000/version| 返回版本信息       |

**注**：如果api报错，请确认.env里的数据库IP，数据库账号，数据库密码是否正确，如果不正确，请修改后执行：

```
docker-compose up --build -d
```
