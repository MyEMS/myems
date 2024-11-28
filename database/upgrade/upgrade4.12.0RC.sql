-- ---------------------------------------------------------------------------------------------------------------------
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- THIS SCRIPT IS ONLY FOR UPGRADING 4.11.0 TO 4.12.0
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

ALTER TABLE myems_system_db.tbl_photovoltaic_power_stations_invertors
ADD generation_meter_id BIGINT NOT NULL AFTER `total_energy_point_id`;

ALTER TABLE myems_system_db.tbl_photovoltaic_power_stations_invertors
ADD shutdown_time_point_id BIGINT NULL AFTER `mppt_10_energy_point_id`;

ALTER TABLE myems_system_db.tbl_photovoltaic_power_stations_invertors
ADD startup_time_point_id BIGINT NULL AFTER `mppt_10_energy_point_id`;


-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='4.12.0RC', release_date='2024-12-12' WHERE id=1;

COMMIT;