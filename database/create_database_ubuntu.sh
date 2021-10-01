#!/bin/sh

mypassword="pAssw0rd@12345"

mysql -uroot -p$mypassword < myems_billing_baseline_db.sql
mysql -uroot -p$mypassword < myems_billing_db.sql
mysql -uroot -p$mypassword < myems_energy_baseline_db.sql
mysql -uroot -p$mypassword < myems_energy_db.sql
mysql -uroot -p$mypassword < myems_fdd_db.sql
mysql -uroot -p$mypassword < myems_historical_db.sql
mysql -uroot -p$mypassword < myems_reporting_db.sql
mysql -uroot -p$mypassword < myems_system_db.sql
mysql -uroot -p$mypassword < myems_user_db.sql
mysql -uroot -p$mypassword < demo/myems_system_db.sql