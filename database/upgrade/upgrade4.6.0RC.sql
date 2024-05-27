-- ---------------------------------------------------------------------------------------------------------------------
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- THIS SCRIPT IS ONLY FOR UPGRADING 4.5.0 TO 4.6.0
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

CREATE TABLE IF NOT EXISTS `myems_historical_db`.`tbl_energy_plan_files` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `file_name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `upload_datetime_utc` DATETIME NOT NULL,
  `status` VARCHAR(45) NOT NULL COMMENT 'new, done, error',
  `file_object` LONGBLOB NOT NULL,
  PRIMARY KEY (`id`));


ALTER TABLE myems_system_db.tbl_microgrids_power_conversion_systems ADD `total_discharge_energy` DECIMAL(18, 3) NOT NULL AFTER `rated_output_power`;
ALTER TABLE myems_system_db.tbl_microgrids_power_conversion_systems ADD `total_charge_energy` DECIMAL(18, 3) NOT NULL AFTER `rated_output_power`;
ALTER TABLE myems_system_db.tbl_microgrids_power_conversion_systems ADD `today_discharge_energy` DECIMAL(18, 3) NOT NULL AFTER `rated_output_power`;
ALTER TABLE myems_system_db.tbl_microgrids_power_conversion_systems ADD `today_charge_energy` DECIMAL(18, 3) NOT NULL AFTER `rated_output_power`;

ALTER TABLE myems_system_db.tbl_energy_storage_containers_power_conversion_systems ADD `total_discharge_energy` DECIMAL(18, 3) NOT NULL AFTER `rated_output_power`;
ALTER TABLE myems_system_db.tbl_energy_storage_containers_power_conversion_systems ADD `total_charge_energy` DECIMAL(18, 3) NOT NULL AFTER `rated_output_power`;
ALTER TABLE myems_system_db.tbl_energy_storage_containers_power_conversion_systems ADD `today_discharge_energy` DECIMAL(18, 3) NOT NULL AFTER `rated_output_power`;
ALTER TABLE myems_system_db.tbl_energy_storage_containers_power_conversion_systems ADD `today_charge_energy` DECIMAL(18, 3) NOT NULL AFTER `rated_output_power`;

-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='4.6.0RC', release_date='2024-06-18' WHERE id=1;

COMMIT;
