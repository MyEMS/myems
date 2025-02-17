-- ---------------------------------------------------------------------------------------------------------------------
-- 警告：升级前备份数据库
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- 此脚本仅用于将5.1.0升级到5.2.0
-- THIS SCRIPT IS ONLY FOR UPGRADING 5.1.0 TO 5.2.0
-- 当前版本号在`myems_system_db`.`tbl_versions`中查看
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;


ALTER TABLE `myems_historical_db`.`tbl_text_value_latest`
RENAME INDEX `tbl_energy_value_latest_index_1` TO `tbl_text_value_latest_index_1`;

ALTER TABLE `myems_system_db`.`tbl_tariffs_timeofuses`
MODIFY COLUMN `peak_type` varchar(8) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
COMMENT 'Peak Type: \ntoppeak - Top-Peak尖\nonpeak - On-Peak峰\nmidpeak - Mid-Peak平\noffpeak - Off-Peak谷\ndeep - Deep Valley深谷'
AFTER `end_time_of_day`;

ALTER TABLE `myems_system_db`.`tbl_energy_storage_containers_schedules`
MODIFY COLUMN `peak_type` varchar(8) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
COMMENT 'Peak Type: \ntoppeak - Top-Peak尖\nonpeak - On-Peak峰\nmidpeak - Mid-Peak平\noffpeak - Off-Peak谷\ndeep - Deep-Valley深谷'
AFTER `end_time_of_day`;

ALTER TABLE `myems_system_db`.`tbl_microgrids_schedules`
MODIFY COLUMN `peak_type` varchar(8) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
COMMENT 'Peak Type: \ntoppeak - Top-Peak尖\nonpeak - On-Peak峰\nmidpeak - Mid-Peak平\noffpeak - Off-Peak谷\ndeep - Deep-Valley深谷'
AFTER `end_time_of_day`;

ALTER TABLE `myems_system_db`.`tbl_charging_stations`
ADD COLUMN `longitude_point_id` BIGINT AFTER `longitude`;
ALTER TABLE `myems_system_db`.`tbl_charging_stations`
ADD COLUMN `latitude_point_id` BIGINT AFTER `longitude`;
ALTER TABLE `myems_system_db`.`tbl_charging_stations`
ADD COLUMN `svg5_id` BIGINT AFTER `svg_id`;
ALTER TABLE `myems_system_db`.`tbl_charging_stations`
ADD COLUMN `svg4_id` BIGINT AFTER `svg_id`;
ALTER TABLE `myems_system_db`.`tbl_charging_stations`
ADD COLUMN `svg3_id` BIGINT AFTER `svg_id`;
ALTER TABLE `myems_system_db`.`tbl_charging_stations`
ADD COLUMN `svg2_id` BIGINT AFTER `svg_id`;

ALTER TABLE `myems_system_db`.`tbl_energy_storage_power_stations`
ADD COLUMN `longitude_point_id` BIGINT AFTER `longitude`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_power_stations`
ADD COLUMN `latitude_point_id` BIGINT AFTER `longitude`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_power_stations`
ADD COLUMN `svg5_id` BIGINT AFTER `svg_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_power_stations`
ADD COLUMN `svg4_id` BIGINT AFTER `svg_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_power_stations`
ADD COLUMN `svg3_id` BIGINT AFTER `svg_id`;
ALTER TABLE `myems_system_db`.`tbl_energy_storage_power_stations`
ADD COLUMN `svg2_id` BIGINT AFTER `svg_id`;

ALTER TABLE `myems_system_db`.`tbl_microgrids`
ADD COLUMN `longitude_point_id` BIGINT AFTER `longitude`;
ALTER TABLE `myems_system_db`.`tbl_microgrids`
ADD COLUMN `latitude_point_id` BIGINT AFTER `longitude`;
ALTER TABLE `myems_system_db`.`tbl_microgrids`
ADD COLUMN `svg5_id` BIGINT AFTER `svg_id`;
ALTER TABLE `myems_system_db`.`tbl_microgrids`
ADD COLUMN `svg4_id` BIGINT AFTER `svg_id`;
ALTER TABLE `myems_system_db`.`tbl_microgrids`
ADD COLUMN `svg3_id` BIGINT AFTER `svg_id`;
ALTER TABLE `myems_system_db`.`tbl_microgrids`
ADD COLUMN `svg2_id` BIGINT AFTER `svg_id`;

ALTER TABLE `myems_system_db`.`tbl_photovoltaic_power_stations`
ADD COLUMN `longitude_point_id` BIGINT AFTER `longitude`;
ALTER TABLE `myems_system_db`.`tbl_photovoltaic_power_stations`
ADD COLUMN `latitude_point_id` BIGINT AFTER `longitude`;
ALTER TABLE `myems_system_db`.`tbl_photovoltaic_power_stations`
ADD COLUMN `svg5_id` BIGINT AFTER `svg_id`;
ALTER TABLE `myems_system_db`.`tbl_photovoltaic_power_stations`
ADD COLUMN `svg4_id` BIGINT AFTER `svg_id`;
ALTER TABLE `myems_system_db`.`tbl_photovoltaic_power_stations`
ADD COLUMN `svg3_id` BIGINT AFTER `svg_id`;
ALTER TABLE `myems_system_db`.`tbl_photovoltaic_power_stations`
ADD COLUMN `svg2_id` BIGINT AFTER `svg_id`;

ALTER TABLE `myems_system_db`.`tbl_wind_farms`
ADD COLUMN `longitude_point_id` BIGINT AFTER `longitude`;
ALTER TABLE `myems_system_db`.`tbl_wind_farms`
ADD COLUMN `latitude_point_id` BIGINT AFTER `longitude`;
ALTER TABLE `myems_system_db`.`tbl_wind_farms`
ADD COLUMN `svg5_id` BIGINT AFTER `svg_id`;
ALTER TABLE `myems_system_db`.`tbl_wind_farms`
ADD COLUMN `svg4_id` BIGINT AFTER `svg_id`;
ALTER TABLE `myems_system_db`.`tbl_wind_farms`
ADD COLUMN `svg3_id` BIGINT AFTER `svg_id`;
ALTER TABLE `myems_system_db`.`tbl_wind_farms`
ADD COLUMN `svg2_id` BIGINT AFTER `svg_id`;

-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='5.2.0RC', release_date='2025-02-15' WHERE id=1;

COMMIT;