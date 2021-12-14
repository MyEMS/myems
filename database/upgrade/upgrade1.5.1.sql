
ALTER TABLE `myems_user_db`.`tbl_users` ADD `failed_login_count` INT NOT NULL DEFAULT 0 AFTER password_expiration_datetime_utc;


-- UPDATE VERSION NUMBER
UPDATE myems_system_db.tbl_versions SET version='1.5.1', release_date='2021-12-18' WHERE id=1;
