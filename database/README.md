## MyEMS Database

### Introduction

Database schema and scripts for MyEMS.

### Prerequisites
 [MySQL 8.0 (64bit) or later](https://www.mysql.com/)

 or 
 
[MariaDB 10.5 (64bit) or later](https://mariadb.org/)
 
 or 
 
[SingleStore 7.0 or later](https://www.singlestore.com/)

### Installation

Execute the following scripts in MySQL commandline, or execute in other MySQL client tools such as MySQL Workbench, Navicat, DBaver, phpMyAdmin, etc.
```bash
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
To insert demo data execute the following scripts,
```bash
cd myems/database/demo
mysql -u root -p < myems_system_db.sql
```
#### Change COLLATE for MySQL server before version 8.0
```bash
sudo nano /etc/mysql/my.cnf
```
```bash
[client]
default-character-set = utf8mb4
[mysql]
default-character-set = utf8mb4
[mysqld]
character-set-client-handshake = FALSE
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci
```
#### Fix MySQL Error: Got a packet bigger than 'max_allowed_packet' bytes
Change the my.cnf or my.ini file (usually found in /etc/mysql/) under the mysqld section and set:
```
max_allowed_packet=100M
```
or you could run these commands in a MySQL console connected to that same server:
```
set global net_buffer_length=1000000;
set global max_allowed_packet=1000000000;
```

#### Don't Install Database in Docker

### Database Definition

#### myems_billing_baseline_db

#### myems_billing_db

#### myems_energy_baseline_db

#### myems_energy_db

#### myems_fdd_db

#### myems_historical_db

#### myems_reporting_db

#### myems_system_db

#### myems_user_db
