-- ---------------------------------------------------------------------------------------------------------------------
-- 警告：升级前备份数据库
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- 此脚本仅用于将5.2.0升级到5.3.0
-- THIS SCRIPT IS ONLY FOR UPGRADING 5.2.0 TO 5.3.0
-- 当前版本号在`myems_system_db`.`tbl_versions`中查看
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_hybrid_power_stations_bmses_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `bms_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_hybrid_power_stations_bmses_points_index_1`
ON `myems_system_db`.`tbl_hybrid_power_stations_bmses_points` (`bms_id`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_hybrid_power_stations_pcses_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `pcs_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_hybrid_power_stations_pcses_points_index_1`
ON `myems_system_db`.`tbl_hybrid_power_stations_pcses_points` (`pcs_id`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_hybrid_power_stations_pvs_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `pv_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_hybrid_power_stations_pvs_points_index_1`
ON `myems_system_db`.`tbl_hybrid_power_stations_pvs_points` (`pv_id`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_hybrid_power_stations_generators_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `generator_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_hybrid_power_stations_generators_points_index_1`
ON `myems_system_db`.`tbl_hybrid_power_stations_generators_points` (`generator_id`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_hybrid_power_stations_cms_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `cm_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_hybrid_power_stations_cms_points_index_1`
ON `myems_system_db`.`tbl_hybrid_power_stations_cms_points` (`cm_id`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_hybrid_power_stations_loads_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `load_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_hybrid_power_stations_loads_points_index_1`
ON `myems_system_db`.`tbl_hybrid_power_stations_loads_points` (`load_id`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids_bmses_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `bms_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_bmses_points_index_1`
ON `myems_system_db`.`tbl_microgrids_bmses_points` (`bms_id`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids_pcses_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `pcs_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_pcses_points_index_1`
ON `myems_system_db`.`tbl_microgrids_pcses_points` (`pcs_id`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids_evchargers_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `evcharger_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_evchargers_points_index_1`
ON `myems_system_db`.`tbl_microgrids_evchargers_points` (`evcharger_id`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids_generators_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `generator_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_generators_points_index_1`
ON `myems_system_db`.`tbl_microgrids_generators_points` (`generator_id`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids_grids_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `grid_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_grids_points_index_1`
ON `myems_system_db`.`tbl_microgrids_grids_points` (`grid_id`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids_heatpumps_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `heatpump_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_heatpumps_points_index_1`
ON `myems_system_db`.`tbl_microgrids_heatpumps_points` (`heatpump_id`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids_loads_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `load_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_loads_points_index_1`
ON `myems_system_db`.`tbl_microgrids_loads_points` (`load_id`);

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_microgrids_pvs_points` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `pv_id` BIGINT NOT NULL,
  `point_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_microgrids_pvs_points_index_1`
ON `myems_system_db`.`tbl_microgrids_pvs_points` (`pv_id`);

-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='5.3.0RC', release_date='2025-03-15' WHERE id=1;

COMMIT;