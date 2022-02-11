-- ---------------------------------------------------------------------------------------------------------------------
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- THIS SCRIPT IS ONLY FOR UPGRADING 1.0.0 TO 1.0.1
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_fdd_db`.`tbl_rules`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_fdd_db`.`tbl_rules` ;

CREATE TABLE IF NOT EXISTS `myems_fdd_db`.`tbl_rules` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(128) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `fdd_code` VARCHAR(128) NOT NULL COMMENT 'SYSTEM01, SPACE01, SPACE02, ... METER01, METER02, ...',
  `category` VARCHAR(128) NOT NULL COMMENT 'SYSTEM, SPACE, METER, TENANT, STORE, SHOPFLOOR, EQUIPMENT, COMBINEDEQUIPMENT',
  `priority` VARCHAR(128) NOT NULL COMMENT 'CRITICAL, HIGH, MEDIUM, LOW',
  `channel` VARCHAR(128) NOT NULL COMMENT 'WEB, EMAIL, SMS, WECHAT, CALL',
  `expression` JSON NOT NULL COMMENT 'JSON string of diagnosed objects, points, values, and recipients',
  `message_template` TEXT NOT NULL COMMENT 'Plain text template that supports $-substitutions',
  `is_enabled` BOOL NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_rules_index_1` ON  `myems_fdd_db`.`tbl_rules`  (`name`);

-- ----------------------------------------------------------------------------------
-- Table `myems_fdd_db`.`tbl_web_messages`
-- ----------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_fdd_db`.`tbl_web_messages` ;

CREATE TABLE IF NOT EXISTS `myems_fdd_db`.`tbl_web_messages` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL COMMENT 'foreign key to myems_user_db.tbl_users',
  `subject` VARCHAR(128) NOT NULL,
  `category` VARCHAR(128) NOT NULL COMMENT 'SYSTEM, SPACE, METER, TENANT, STORE, SHOPFLOOR, EQUIPMENT, COMBINEDEQUIPMENT',
  `priority` VARCHAR(128) NOT NULL COMMENT 'CRITICAL, HIGH, MEDIUM, LOW',
  `message` LONGTEXT NOT NULL,
  `created_datetime_utc` DATETIME NOT NULL,
  `status` VARCHAR(32) NOT NULL COMMENT 'new, acknowledged, timeout',
  `reply` LONGTEXT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_web_messages_index_1` ON  `myems_fdd_db`.`tbl_web_messages`  (`user_id`, `status`, `created_datetime_utc`);


-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='1.0.1', release_date='2021-01-28' WHERE id=1;

COMMIT;
