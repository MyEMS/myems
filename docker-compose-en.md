## Docker Compose
Create and start all the services with a single command 

### Prerequisite

- Installed docker, docker-compose, npm on a host.
- Installed MySQL database with username 'root' and password '!MyEMS1'.
- The MySQL database can be connected from the host where Docker is installed.

### Configuration

**Note**: The host here refers to the host where docker is installed. The IP and account password here are assumed and used to show instructions. Please modify them as appropriate.

| --                | --          |
| ----------        | ----------- |
| Host IP           | 192.168.0.1 |
| Database IP       | 192.168.0.2 |
| Database User     | root        |
| Database Password | !MyEMS1     |

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
Note: Refer to [database/README.md](./database/README.md)


3.  Modify Config

**Note**：The host IP assumed here is 192.168.0.1, the database IP is 192.168.0.2, the database account is: root, and the database password is: !MyEMS1, please modify as appropriate

3.1  Modify api address in nginx.conf
```
cd myems
sed -i 's/127.0.0.1:8000/192.168.0.1:8000/g' admin/nginx.conf
sed -i 's/127.0.0.1:8000/192.168.0.1:8000/g' web/nginx.conf
```

3.2  Copy example.env to .env and modify database IP, username and password in .env
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

3.3 Modify upload folder in docker-compose.yml
If Windows host, use c:\upload for volumes/source in api and admin services.
If Linux host, use /upload for volumes/source in api and admin services.
Make sure the upload folders in api and admin are same folder on host.

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

|       | Address                 | Expected Result  |
| ----- | ----------------------- | ---------------- |
| web   | 192.168.0.1:80          | Login succeeded by entering account and password |
| admin | 192.168.0.1:8001        | Login succeeded by entering account and password |
| api   | 192.168.0.1:8000/version| Return version information |

**Note**：If the API reports an error, please confirm Whether the database IP, database account and database password in .env are correct. If not, please modify them then execute:
```
docker-compose up --build -d
```
