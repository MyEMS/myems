-- PLEASE CHECK YOUR DATABASE TABLE myems_system_db.tbl_gateway,
-- If the tbl_gateways is empty
-- then run the statement below to insert the default gateway data
-- else please ignore and only run the update version number statement.

-- ---------------------------------------------------------------------------------------------------------------------
-- Default Data for table `myems_system_db`.`tbl_gateways`
-- This gateway's token is used by myems-modbus-tcp service
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_gateways`
(`id`, `name`, `uuid`, `token`,  `last_seen_datetime_utc`)
VALUES
(1, 'MyEMS Gateway 1', 'dc681938-5053-8660-98ed-266c58227231', '983427af-1c35-42ba-8b4d-288675550225', null);

COMMIT;

-- UPDATE VERSION NUMBER
UPDATE myems_system_db.tbl_versions SET version='1.3.4', release_date='2021-11-06' WHERE id=1;
