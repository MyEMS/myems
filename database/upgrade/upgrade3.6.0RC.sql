-- ---------------------------------------------------------------------------------------------------------------------
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- THIS SCRIPT IS ONLY FOR UPGRADING 3.5.0 TO 3.6.0
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids_windturbines` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `microgrid_id` BIGINT NOT NULL,
  `capacity` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_windturbines_index_1` ON  `myems_system_db`.`tbl_microgrids_windturbines` (`name`);

-- ----------------------------
-- Table structure for `myems_user_db`.tbl_verification_codes
-- ----------------------------
DROP TABLE IF EXISTS `myems_user_db`.`tbl_verification_codes`;

CREATE TABLE IF NOT EXISTS `myems_user_db`.`tbl_verification_codes`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `recipient_email` VARCHAR(128) NOT NULL,
  `verification_code` VARCHAR(128) NOT NULL,
  `created_datetime_utc` DATETIME NOT NULL,
  `expires_datetime_utc` DATETIME NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_verirication_codes_index_1` ON `myems_user_db`.`tbl_verification_codes` (`recipient_email`, `created_datetime_utc`);

-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='3.6.0RC', release_date='2023-06-18' WHERE id=1;

COMMIT;