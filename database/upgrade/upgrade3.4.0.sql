-- ---------------------------------------------------------------------------------------------------------------------
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- THIS SCRIPT IS ONLY FOR UPGRADING 3.3.0 TO 3.4.0
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_commands`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_commands` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_commands` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `topic` VARCHAR(255) NOT NULL,
  `payload` LONGTEXT NOT NULL COMMENT 'MUST be in JSON format',
  `set_value` DECIMAL(18, 3) NULL COMMENT 'If not null, the $s1 in payload will be replaced with this value',
  `description` VARCHAR(255) ,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_commands_index_1` ON  `myems_system_db`.`tbl_commands` (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_combined_equipments_commands`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_combined_equipments_commands` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_combined_equipments_commands` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `combined_equipment_id` BIGINT NOT NULL,
  `command_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_combined_equipments_comands_index_1` ON  `myems_system_db`.`tbl_combined_equipments_commands`   (`combined_equipment_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_equipments_commands`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_equipments_commands` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_equipments_commands` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `equipment_id` BIGINT NOT NULL,
  `command_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_equipments_comands_index_1` ON  `myems_system_db`.`tbl_equipments_commands`   (`equipment_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_meters_commands`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_meters_commands` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_meters_commands` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `meter_id` BIGINT NOT NULL,
  `command_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_meters_commands_index_1` ON  `myems_system_db`.`tbl_meters_commands`   (`meter_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_microgrids_commands`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_microgrids_commands` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids_commands` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `command_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_commands_index_1` ON  `myems_system_db`.`tbl_microgrids_commands`   (`microgrid_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_spaces_commands`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_spaces_commands` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_spaces_commands` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `space_id` BIGINT NOT NULL,
  `command_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_spaces_commands_index_1` ON  `myems_system_db`.`tbl_spaces_commands`   (`space_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_tenants_commands`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_tenants_commands` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_tenants_commands` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` BIGINT NOT NULL,
  `command_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_tenants_commands_index_1` ON  `myems_system_db`.`tbl_tenants_commands`   (`tenant_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_shopfloors_commands`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_shopfloors_commands` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_shopfloors_commands` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `shopfloor_id` BIGINT NOT NULL,
  `command_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_shopfloors_commands_index_1` ON  `myems_system_db`.`tbl_shopfloors_commands`   (`shopfloor_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_stores_commands`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_stores_commands` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_stores_commands` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `store_id` BIGINT NOT NULL,
  `command_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_stores_commands_index_1` ON  `myems_system_db`.`tbl_stores_commands`   (`store_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_microgrids`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_microgrids` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `address` VARCHAR(255) NOT NULL,
  `latitude` DECIMAL(9, 6) NOT NULL,
  `longitude` DECIMAL(9, 6) NOT NULL,
  `capacity` DECIMAL(18, 3) NOT NULL,
  `microgrid_type_id` BIGINT NOT NULL,
  `microgrid_owner_type_id` BIGINT NOT NULL,
  `is_input_counted` BOOL NOT NULL,
  `is_output_counted` BOOL NOT NULL,
  `contact_id` BIGINT NOT NULL,
  `cost_center_id` BIGINT NOT NULL,
  `description` VARCHAR(255),
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_index_1` ON  `myems_system_db`.`tbl_microgrids`   (`name`);


-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_microgrid_architecture_types`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_microgrid_architecture_types` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrid_architecture_types` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `simplified_code` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrid_architecture_types_index_1` ON  `myems_system_db`.`tbl_microgrid_architecture_types`   (`name`);


-- ---------------------------------------------------------------------------------------------------------------------
-- Default data for table `myems_system_db`.`tbl_microgrid_architecture_types`
-- ---------------------------------------------------------------------------------------------------------------------

INSERT INTO `myems_system_db`.`tbl_microgrid_architecture_types`
(`id`, `name`, `uuid`, `description`, `simplified_code`)
VALUES
(1, 'Battery+PV+Load+Grid', '0683741e-df76-4b43-b0c3-4851d20767ca', 'Battery+PV+Load+Grid', 'BPLG'),
(2, 'Battery+Load+Grid', 'b8f0bc44-f9f8-4dfd-9b08-271ee1627a46', 'Battery+Load+Grid', 'BLG'),
(3, 'PV+Load+Grid', 'd067d432-bc04-4184-81a1-df3fb2f30480', 'PV+Load+Grid', 'PLG');

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_microgrid_owner_types`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_microgrid_owner_types` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrid_owner_types` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `simplified_code` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrid_owner_types_index_1` ON  `myems_system_db`.`tbl_microgrid_owner_types`   (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Default data for table `myems_system_db`.`tbl_microgrid_owner_types`
-- ---------------------------------------------------------------------------------------------------------------------

INSERT INTO `myems_system_db`.`tbl_microgrid_owner_types`
(`id`, `name`, `uuid`, `description`, `simplified_code`)
VALUES
(1, 'Residential', 'b0b5334a-99a6-4a34-b99f-7c6c6f423c47', 'Residential', 'RES'),
(2, 'Commerical', '0017276e-8541-48fc-ae0a-b04d6c31db2d', 'Commerical', 'COM'),
(3, 'Industrial', 'e99fceda-1b34-4b6a-8bd2-c8532c835322', 'Industry', 'IND');


-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_microgrids_batteries`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_microgrids_batteries` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids_batteries` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `microgrid_id` BIGINT NOT NULL,
  `capacity` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_batteries_index_1` ON  `myems_system_db`.`tbl_microgrids_batteries`   (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_microgrids_photovoltaics`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_microgrids_photovoltaics` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids_photovoltaics` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `microgrid_id` BIGINT NOT NULL,
  `capacity` DECIMAL(18, 3) NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_photovoltaics_index_1` ON  `myems_system_db`.`tbl_microgrids_photovoltaics`   (`name`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_microgrids_sensors`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_microgrids_sensors` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids_sensors` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `microgrid_id` BIGINT NOT NULL,
  `sensor_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_sensors_index_1` ON  `myems_system_db`.`tbl_microgrids_sensors`   (`microgrid_id`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_user_db`.`tbl_new_users`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_user_db`.`tbl_new_users` ;

CREATE TABLE IF NOT EXISTS `myems_user_db`.`tbl_new_users` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(128) NOT NULL,
  `uuid` CHAR(36) NOT NULL,
  `display_name` VARCHAR(128) NOT NULL,
  `email` VARCHAR(128) NOT NULL,
  `salt` VARCHAR(128) NOT NULL,
  `password` VARCHAR(256) NOT NULL,
  PRIMARY KEY (`id`));

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_user_db`.`tbl_email_messages`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_user_db`.`tbl_email_messages`;

CREATE TABLE IF NOT EXISTS `myems_user_db`.`tbl_email_messages`  (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `recipient_name` VARCHAR(128) NOT NULL,
  `recipient_email` VARCHAR(128) NOT NULL,
  `subject` VARCHAR(128) NOT NULL,
  `message` LONGTEXT NOT NULL,
  `attachment_file_name` VARCHAR(128) NULL DEFAULT NULL,
  `attachment_file_object` LONGBLOB NULL,
  `created_datetime_utc` DATETIME NOT NULL,
  `scheduled_datetime_utc` DATETIME NOT NULL,
  `status` VARCHAR(32) NOT NULL COMMENT 'new, sent, timeout',
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_email_messages_index_1` ON  `myems_user_db`.`tbl_email_messages` (`status`, `scheduled_datetime_utc`);

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_user_db`.`tbl_email_message_sessions`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_user_db`.`tbl_email_message_sessions`;

CREATE TABLE IF NOT EXISTS `myems_user_db`.`tbl_email_message_sessions`  (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `recipient_email` VARCHAR(128) NOT NULL,
  `token` VARCHAR(128) NOT NULL,
  `expires_datetime_utc` DATETIME NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_email_message_sessions_index_1` ON  `myems_user_db`.`tbl_email_message_sessions` (`recipient_email`);

-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='3.4.0', release_date='2023-06-01' WHERE id=1;

COMMIT;