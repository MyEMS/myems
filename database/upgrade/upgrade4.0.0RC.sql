-- ---------------------------------------------------------------------------------------------------------------------
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- THIS SCRIPT IS ONLY FOR UPGRADING 3.12.0 TO 4.0.0
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

RENAME TABLE myems_system_db.tbl_energy_storage_power_stations TO myems_system_db.tbl_energy_storage_containers;
DROP TABLE IF EXISTS `myems_system_db`.`tbl_energy_storage_power_stations_batteries` ;
DROP TABLE IF EXISTS `myems_system_db`.`tbl_energy_storage_power_stations_commands` ;
DROP TABLE IF EXISTS `myems_system_db`.`tbl_energy_storage_power_stations_grids` ;
DROP TABLE IF EXISTS `myems_system_db`.`tbl_energy_storage_power_stations_loads` ;
DROP TABLE IF EXISTS `myems_system_db`.`tbl_energy_storage_power_stations_power_conversion_systems` ;
DROP TABLE IF EXISTS `myems_system_db`.`tbl_energy_storage_power_stations_sensors` ;
DROP TABLE IF EXISTS `myems_system_db`.`tbl_energy_storage_power_stations_users` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_storage_containers_batteries` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `energy_storage_container_id` BIGINT NOT NULL,
  `battery_state_point_id` BIGINT NOT NULL,
  `soc_point_id` BIGINT NOT NULL,
  `power_point_id` BIGINT NOT NULL,
  `charge_meter_id` BIGINT NOT NULL,
  `discharge_meter_id` BIGINT NOT NULL,
  `capacity` DECIMAL(18, 3) NOT NULL,
  `nominal_voltage` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_containers_batteries_index_1` ON  `myems_system_db`.`tbl_energy_storage_containers_batteries` (`name`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_storage_containers_commands` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_container_id` BIGINT NOT NULL,
  `command_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_containers_commands_index_1` ON  `myems_system_db`.`tbl_energy_storage_containers_commands`   (`energy_storage_container_id`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_storage_containers_power_conversion_systems` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `energy_storage_container_id` BIGINT NOT NULL,
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
CREATE INDEX `tbl_energy_storage_containers_pcs_index_1` ON  `myems_system_db`.`tbl_energy_storage_containers_power_conversion_systems` (`name`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_storage_containers_grids` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `energy_storage_container_id` BIGINT NOT NULL,
  `power_point_id` BIGINT NOT NULL,
  `buy_meter_id` BIGINT NOT NULL,
  `sell_meter_id` BIGINT NOT NULL,
  `capacity` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_containers_grids_index_1` ON  `myems_system_db`.`tbl_energy_storage_containers_grids` (`name`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_storage_containers_loads` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `energy_storage_container_id` BIGINT NOT NULL,
  `power_point_id` BIGINT NOT NULL,
  `meter_id` BIGINT NOT NULL,
  `capacity` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_containers_grids_index_1` ON  `myems_system_db`.`tbl_energy_storage_containers_loads` (`name`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_storage_containers_sensors` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_container_id` BIGINT NOT NULL,
  `sensor_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_containers_sensors_index_1` ON  `myems_system_db`.`tbl_energy_storage_containers_sensors` (`energy_storage_container_id`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_storage_containers_users` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_container_id` BIGINT NOT NULL,
  `user_id` BIGINT NOT NULL COMMENT 'primary key in myems_user_db.tbl_users',
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_containers_users_index_1` ON  `myems_system_db`.`tbl_energy_storage_containers_users` (`energy_storage_container_id`);


-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_energy_storage_power_stations`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_energy_storage_power_stations` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_storage_power_stations` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `address` VARCHAR(255) NOT NULL,
  `postal_code` VARCHAR(255) NOT NULL,
  `latitude` DECIMAL(9, 6) NOT NULL,
  `longitude` DECIMAL(9, 6) NOT NULL,
  `capacity` DECIMAL(18, 3) NOT NULL,
  `contact_id` BIGINT NOT NULL,
  `cost_center_id` BIGINT NOT NULL,
  `svg` LONGTEXT NOT NULL,
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_power_stations_index_1` ON  `myems_system_db`.`tbl_energy_storage_power_stations` (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_energy_storage_power_stations_containers`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_energy_storage_power_stations_containers` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_storage_power_stations_containers` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_storage_power_station_id` BIGINT NOT NULL,
  `energy_storage_container_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_storage_power_stations_containers_index_1` ON  `myems_system_db`.`tbl_energy_storage_power_stations_containers` (`energy_storage_power_station_id`);

-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='4.0.0RC', release_date='2024-01-01' WHERE id=1;

COMMIT;
