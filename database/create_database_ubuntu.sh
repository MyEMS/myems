#!/bin/sh

e_mypassword="U2FsdGVkX1+VZdIDGQqLkpIvF47w7nq+UyZAetppy2k="

mypassword=`echo $e_mypassword |openssl enc -aes-256-cbc -md sha512 -a -d -pbkdf2 -iter 100000 -salt -pass pass:$mypass`

mysql -uroot -p$mypassword < myems_billing_baseline_db.sql
mysql -uroot -p$mypassword < myems_billing_db.sql
mysql -uroot -p$mypassword < myems_energy_baseline_db.sql
mysql -uroot -p$mypassword < myems_energy_db.sql
mysql -uroot -p$mypassword < myems_fdd_db.sql
mysql -uroot -p$mypassword < myems_historical_db.sql
mysql -uroot -p$mypassword < myems_reporting_db.sql
mysql -uroot -p$mypassword < myems_system_db.sql
mysql -uroot -p$mypassword < myems_user_db.sql
mysql -uroot -p$mypassword < demo-en/myems_system_db.sql