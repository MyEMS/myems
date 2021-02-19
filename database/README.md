## MyEMS Database

### Introduction

Providing database schema and scripts for MyEMS.


### Prerequisites
 [MySQL 8.0 or later](https://www.mysql.com/)

 or [MariaDB 10.5 or later](https://mariadb.org/)
 
 or [SingleStore 7.0 or later](https://www.singlestore.com/) (highly recommended)


### Installation

Execute the scripts in MySQL commandline as below, or execute in orther MySQL client tools such as MySQL Workbench, Navicat, DBaver, phpMyAdmin, etc.
```
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

#### Change COLLATE for MySQL server before version 8.0
```
sudo nano /etc/mysql/my.cnf
```
```
[client]
default-character-set = utf8mb4
[mysql]
default-character-set = utf8mb4
[mysqld]
character-set-client-handshake = FALSE
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci
```

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
