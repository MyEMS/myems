-- ---------------------------------------------------------------------------------------------------------------------
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- THIS SCRIPT IS ONLY FOR UPGRADING 4.4.0 TO 4.5.0
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

INSERT INTO myems_system_db.tbl_menus (id, name, route, parent_menu_id, is_hidden)
VALUES
(112,'Plan','/space/plan',100,1),
(213,'Plan','/equipment/plan',200,1),
(322,'Meter Plan','/meter/meterplan',300,1),
(323,'Offline Meter Plan','/meter/offlinemeterplan',300,1),
(324,'Virtual Meter Plan','/meter/virtualmeterplan',300,1),
(410,'Plan','/tenant/plan',400,1),
(509,'Plan','/store/plan',500,1),
(609,'Plan','/shopfloor/plan',600,1),
(712,'Plan','/combinedequipment/plan',700,1);


CREATE TABLE IF NOT EXISTS `myems_energy_db`.`tbl_microgrid_charge_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrid_charge_hourly_index_1` ON `myems_energy_db`.`tbl_microgrid_charge_hourly` (`microgrid_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_energy_db`.`tbl_microgrid_discharge_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrid_discharge_hourly_index_1` ON `myems_energy_db`.`tbl_microgrid_discharge_hourly` (`microgrid_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_billing_db`.`tbl_microgrid_charge_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrid_charge_hourly_index_1` ON `myems_billing_db`.`tbl_microgrid_charge_hourly` (`microgrid_id`, `start_datetime_utc`);

CREATE TABLE IF NOT EXISTS `myems_billing_db`.`tbl_microgrid_discharge_hourly` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `start_datetime_utc` DATETIME NOT NULL,
  `actual_value` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrid_discharge_hourly_index_1` ON `myems_billing_db`.`tbl_microgrid_discharge_hourly` (`microgrid_id`, `start_datetime_utc`);


-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='4.5.0RC', release_date='2024-05-18' WHERE id=1;

COMMIT;
