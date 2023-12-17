-- ---------------------------------------------------------------------------------------------------------------------
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- THIS SCRIPT IS ONLY FOR UPGRADING 3.12.0 TO 4.0.0
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_storage_power_stations_batteries` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `energy_storage_power_station_id` BIGINT NOT NULL,
  `battery_state_point_id` BIGINT NOT NULL,
  `soc_point_id` BIGINT NOT NULL,
  `power_point_id` BIGINT NOT NULL,
  `charge_meter_id` BIGINT NOT NULL,
  `discharge_meter_id` BIGINT NOT NULL,
  `capacity` DECIMAL(18, 3) NOT NULL,
  `nominal_voltage` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_power_stations_batteries_index_1` ON  `myems_system_db`.`tbl_energy_storage_power_stations_batteries` (`name`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_storage_power_stations_commands` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_power_station_id` BIGINT NOT NULL,
  `command_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_power_stations_commands_index_1` ON  `myems_system_db`.`tbl_energy_storage_power_stations_commands`   (`energy_storage_power_station_id`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_storage_power_stations_power_conversion_systems` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `energy_storage_power_station_id` BIGINT NOT NULL,
  `run_state_point_id` BIGINT NOT NULL,
  `capacity` DECIMAL(18, 3) NOT NULL,
  `charge_start_time1_point_id` BIGINT NOT NULL,
  `charge_end_time1_point_id` BIGINT NOT NULL,
  `charge_start_time2_point_id` BIGINT NOT NULL,
  `charge_end_time2_point_id` BIGINT NOT NULL,
  `charge_start_time3_point_id` BIGINT NOT NULL,
  `charge_end_time3_point_id` BIGINT NOT NULL,
  `charge_start_time4_point_id` BIGINT NOT NULL,
  `charge_end_time4_point_id` BIGINT NOT NULL,
  `discharge_start_time1_point_id` BIGINT NOT NULL,
  `discharge_end_time1_point_id` BIGINT NOT NULL,
  `discharge_start_time2_point_id` BIGINT NOT NULL,
  `discharge_end_time2_point_id` BIGINT NOT NULL,
  `discharge_start_time3_point_id` BIGINT NOT NULL,
  `discharge_end_time3_point_id` BIGINT NOT NULL,
  `discharge_start_time4_point_id` BIGINT NOT NULL,
  `discharge_end_time4_point_id` BIGINT NOT NULL,
  `charge_start_time1_command_id` BIGINT NOT NULL,
  `charge_end_time1_command_id` BIGINT NOT NULL,
  `charge_start_time2_command_id` BIGINT NOT NULL,
  `charge_end_time2_command_id` BIGINT NOT NULL,
  `charge_start_time3_command_id` BIGINT NOT NULL,
  `charge_end_time3_command_id` BIGINT NOT NULL,
  `charge_start_time4_command_id` BIGINT NOT NULL,
  `charge_end_time4_command_id` BIGINT NOT NULL,
  `discharge_start_time1_command_id` BIGINT NOT NULL,
  `discharge_end_time1_command_id` BIGINT NOT NULL,
  `discharge_start_time2_command_id` BIGINT NOT NULL,
  `discharge_end_time2_command_id` BIGINT NOT NULL,
  `discharge_start_time3_command_id` BIGINT NOT NULL,
  `discharge_end_time3_command_id` BIGINT NOT NULL,
  `discharge_start_time4_command_id` BIGINT NOT NULL,
  `discharge_end_time4_command_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_power_stations_pcs_index_1` ON  `myems_system_db`.`tbl_energy_storage_power_stations_power_conversion_systems` (`name`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_storage_power_stations_grids` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `energy_storage_power_station_id` BIGINT NOT NULL,
  `power_point_id` BIGINT NOT NULL,
  `buy_meter_id` BIGINT NOT NULL,
  `sell_meter_id` BIGINT NOT NULL,
  `capacity` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_power_stations_grids_index_1` ON  `myems_system_db`.`tbl_energy_storage_power_stations_grids` (`name`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_storage_power_stations_loads` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `energy_storage_power_station_id` BIGINT NOT NULL,
  `power_point_id` BIGINT NOT NULL,
  `meter_id` BIGINT NOT NULL,
  `capacity` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_power_stations_grids_index_1` ON  `myems_system_db`.`tbl_energy_storage_power_stations_loads` (`name`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_storage_power_stations_sensors` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_power_station_id` BIGINT NOT NULL,
  `sensor_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_power_stations_sensors_index_1` ON  `myems_system_db`.`tbl_energy_storage_power_stations_sensors` (`energy_storage_power_station_id`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_storage_power_stations_users` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_power_station_id` BIGINT NOT NULL,
  `user_id` BIGINT NOT NULL COMMENT 'primary key in myems_user_db.tbl_users',
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_power_stations_users_index_1` ON  `myems_system_db`.`tbl_energy_storage_power_stations_users` (`energy_storage_power_station_id`);

-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='4.0.0RC', release_date='2024-01-01' WHERE id=1;

COMMIT;
