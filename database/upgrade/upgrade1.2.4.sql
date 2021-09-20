-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_fdd_db`.`tbl_aliyun_sms_api`
-- refer to https://dysms.console.aliyun.com/
-- API Version 2017-05-25
-- ---------------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `myems_fdd_db`.`tbl_aliyun_sms_api` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `access_key_id` VARCHAR(256) NOT NULL,
  `access_key_secret` VARCHAR(256) NOT NULL,
  `endpoint` VARCHAR(256) NOT NULL,
  `sign_name` VARCHAR(256) NOT NULL,
  `template_code` VARCHAR(256) NOT NULL,
  PRIMARY KEY (`id`));

DROP TABLE IF EXISTS `myems_fdd_db`.`tbl_gsm_modems` ;


ALTER TABLE `myems_user_db`.`tbl_users` ADD `password_expiration_datetime_utc` DATETIME NOT NULL DEFAULT '2099-12-31 16:00:00' AFTER privilege_id;
ALTER TABLE `myems_user_db`.`tbl_users` ADD `account_expiration_datetime_utc` DATETIME NOT NULL DEFAULT '2099-12-31 16:00:00' AFTER privilege_id;

-- UPDATE VERSION NUMBER
UPDATE myems_system_db.tbl_versions SET version='1.2.4', release_date='2021-09-11' WHERE id=1;
