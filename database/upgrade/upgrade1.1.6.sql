-- ---------------------------------------------------------------------------------------------------------------------
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- THIS SCRIPT IS ONLY FOR UPGRADING 1.1.5 TO 1.1.6
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

-- ---------------------------------------------------------------------------------------------------------------------
-- Table `myems_system_db`.`tbl_menus`
-- ---------------------------------------------------------------------------------------------------------------------
DROP TABLE IF EXISTS `myems_system_db`.`tbl_menus` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_menus` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(256) NOT NULL,
  `route` VARCHAR(256) NOT NULL,
  `parent_menu_id` BIGINT,
  `is_hidden` BOOL NOT NULL,
  PRIMARY KEY (`id`));
  
INSERT INTO myems_system_db.tbl_menus (id,name,route, parent_menu_id,is_hidden) 
VALUES
(100,'Space Data','/space',NULL,0),
(101,'Energy Category Data','/space/energycategory',100,0),
(102,'Energy Item Data','/space/energyitem',100,0),
(103,'Cost','/space/cost',100,0),
(104,'Output','/space/output',100,0),
(105,'Income','/space/income',100,0),
(106,'Efficiency','/space/efficiency',100,0),
(107,'Load','/space/load',100,0),
(108,'Statistics','/space/statistics',100,0),
(109,'Saving','/space/saving',100,0),
(200,'Equipment Data','/equipment',NULL,0),
(201,'Energy Category Data','/equipment/energycategory',200,0),
(202,'Energy Item Data','/equipment/energyitem',200,0),
(203,'Cost','/equipment/cost',200,0),
(204,'Output','/equipment/output',200,0),
(205,'Income','/equipment/income',200,0),
(206,'Efficiency','/equipment/efficiency',200,0),
(207,'Load','/equipment/load',200,0),
(208,'Statistics','/equipment/statistics',200,0),
(209,'Saving','/equipment/saving',200,0),
(210,'Batch Analysis','/equipment/batch',200,0),
(211,'Equipment Tracking','/equipment/tracking',200,0),
(300,'Meter Data','/meter',NULL,0),
(301,'Meter Energy','/meter/meterenergy',300,0),
(302,'Meter Cost','/meter/metercost',300,0),
(303,'Meter Trend','/meter/metertrend',300,0),
(304,'Meter Realtime','/meter/meterrealtime',300,0),
(305,'Master Meter Submeters Balance','/meter/metersubmetersbalance',300,0),
(306,'Virtual Meter Energy','/meter/virtualmeterenergy',300,0),
(307,'Virtual Meter Cost','/meter/virtualmetercost',300,0),
(308,'Offline Meter Energy','/meter/offlinemeterenergy',300,0),
(309,'Offline Meter Cost','/meter/offlinemetercost',300,0),
(310,'Batch Analysis','/meter/batch',300,0),
(311,'Meter Tracking','/meter/tracking',300,0),
(400,'Tenant Data','/tenant',NULL,0),
(401,'Energy Category Data','/tenant/energycategory',400,0),
(402,'Energy Item Data','/tenant/energyitem',400,0),
(403,'Cost','/tenant/cost',400,0),
(404,'Load','/tenant/load',400,0),
(405,'Statistics','/tenant/statistics',400,0),
(406,'Saving','/tenant/saving',400,0),
(407,'Tenant Bill','/tenant/bill',400,0),
(408,'Batch Analysis','/tenant/batch',400,0),
(500,'Store Data','/store',NULL,0),
(501,'Energy Category Data','/store/energycategory',500,0),
(502,'Energy Item Data','/store/energyitem',500,0),
(503,'Cost','/store/cost',500,0),
(504,'Load','/store/load',500,0),
(505,'Statistics','/store/statistics',500,0),
(506,'Saving','/store/saving',500,0),
(507,'Batch Analysis','/store/batch',500,0),
(600,'Shopfloor Data','/shopfloor',NULL,0),
(601,'Energy Category Data','/shopfloor/energycategory',600,0),
(602,'Energy Item Data','/shopfloor/energyitem',600,0),
(603,'Cost','/shopfloor/cost',600,0),
(604,'Load','/shopfloor/load',600,0),
(605,'Statistics','/shopfloor/statistics',600,0),
(606,'Saving','/shopfloor/saving',600,0),
(607,'Batch Analysis','/shopfloor/batch',600,0),
(700,'Combined Equipment Data','/combinedequipment',NULL,0),
(701,'Energy Category Data','/combinedequipment/energycategory',700,0),
(702,'Energy Item Data','/combinedequipment/energyitem',700,0),
(703,'Cost','/combinedequipment/cost',700,0),
(704,'Output','/combinedequipment/output',700,0),
(705,'Income','/combinedequipment/income',700,0),
(706,'Efficiency','/combinedequipment/efficiency',700,0),
(707,'Load','/combinedequipment/load',700,0),
(708,'Statistics','/combinedequipment/statistics',700,0),
(709,'Saving','/combinedequipment/saving',700,0),
(710,'Batch Analysis','/combinedequipment/batch',700,0),
(800,'Auxiliary System','/auxiliarysystem',NULL,0),
(801,'Energy Flow Diagram','/auxiliarysystem/energyflowdiagram',800,0),
(802,'Distribution System','/auxiliarysystem/distributionsystem',800,0),
(900,'Fault Detection & Diagnostics','/fdd',NULL,0),
(901,'Space Faults Data','/fdd/space',900,0),
(902,'Equipment Faults Data','/fdd/equipment',900,0),
(903,'Combined Equipment Faults Data','/fdd/combinedequipment',900,0),
(904,'Tenant Faults Data','/fdd/tenant',900,0),
(905,'Store Faults Data','/fdd/store',900,0),
(906,'Shopfloor Faults Data','/fdd/shopfloor',900,0),
(1000,'Monitoring','/monitoring',NULL,0),
(1001,'Space Equipments','/monitoring/space',1000,0),
(1002,'Combined Equipments','/monitoring/equipment',1000,0),
(1003,'Tenant Equipments','/monitoring/combinedequipment',1000,0),
(1004,'Store Equipments','/monitoring/tenant',1000,0),
(1005,'Shopfloor Equipments','/monitoring/store',1000,0),
(1100,'Advanced Reporting','/advancedreporting',NULL,0),
(1200,'Knowledge Base','/knowledgebase',NULL,0);




-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='1.1.6', release_date='2021-08-02' WHERE id=1;

COMMIT;