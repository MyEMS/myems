-- ---------------------------------------------------------------------------------------------------------------------
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- THIS SCRIPT IS ONLY FOR UPGRADING 3.11.0 TO 3.12.0
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;
ALTER TABLE myems_system_db.tbl_microgrids_power_conversion_systems ADD `discharge_end_time4_point_id` BIGINT NOT NULL AFTER `capacity`;
ALTER TABLE myems_system_db.tbl_microgrids_power_conversion_systems ADD `discharge_start_time4_point_id` BIGINT NOT NULL AFTER `capacity`;
ALTER TABLE myems_system_db.tbl_microgrids_power_conversion_systems ADD `discharge_end_time3_point_id` BIGINT NOT NULL AFTER `capacity`;
ALTER TABLE myems_system_db.tbl_microgrids_power_conversion_systems ADD `discharge_start_time3_point_id` BIGINT NOT NULL AFTER `capacity`;
ALTER TABLE myems_system_db.tbl_microgrids_power_conversion_systems ADD `discharge_end_time2_point_id` BIGINT NOT NULL AFTER `capacity`;
ALTER TABLE myems_system_db.tbl_microgrids_power_conversion_systems ADD `discharge_start_time2_point_id` BIGINT NOT NULL AFTER `capacity`;
ALTER TABLE myems_system_db.tbl_microgrids_power_conversion_systems ADD `discharge_end_time1_point_id` BIGINT NOT NULL AFTER `capacity`;
ALTER TABLE myems_system_db.tbl_microgrids_power_conversion_systems ADD `discharge_start_time1_point_id` BIGINT NOT NULL AFTER `capacity`;
ALTER TABLE myems_system_db.tbl_microgrids_power_conversion_systems ADD `charge_end_time4_point_id` BIGINT NOT NULL AFTER `capacity`;
ALTER TABLE myems_system_db.tbl_microgrids_power_conversion_systems ADD `charge_start_time4_point_id` BIGINT NOT NULL AFTER `capacity`;
ALTER TABLE myems_system_db.tbl_microgrids_power_conversion_systems ADD `charge_end_time3_point_id` BIGINT NOT NULL AFTER `capacity`;
ALTER TABLE myems_system_db.tbl_microgrids_power_conversion_systems ADD `charge_start_time3_point_id` BIGINT NOT NULL AFTER `capacity`;
ALTER TABLE myems_system_db.tbl_microgrids_power_conversion_systems ADD `charge_end_time2_point_id` BIGINT NOT NULL AFTER `capacity`;
ALTER TABLE myems_system_db.tbl_microgrids_power_conversion_systems ADD `charge_start_time2_point_id` BIGINT NOT NULL AFTER `capacity`;
ALTER TABLE myems_system_db.tbl_microgrids_power_conversion_systems ADD `charge_end_time1_point_id` BIGINT NOT NULL AFTER `capacity`;
ALTER TABLE myems_system_db.tbl_microgrids_power_conversion_systems ADD `charge_start_time1_point_id` BIGINT NOT NULL AFTER `capacity`;

ALTER TABLE myems_system_db.tbl_microgrids_power_conversion_systems ADD `discharge_end_time4_command_id` BIGINT NOT NULL AFTER `discharge_end_time4_point_id`;
ALTER TABLE myems_system_db.tbl_microgrids_power_conversion_systems ADD `discharge_start_time4_command_id` BIGINT NOT NULL AFTER `discharge_end_time4_point_id`;
ALTER TABLE myems_system_db.tbl_microgrids_power_conversion_systems ADD `discharge_end_time3_command_id` BIGINT NOT NULL AFTER `discharge_end_time4_point_id`;
ALTER TABLE myems_system_db.tbl_microgrids_power_conversion_systems ADD `discharge_start_time3_command_id` BIGINT NOT NULL AFTER `discharge_end_time4_point_id`;
ALTER TABLE myems_system_db.tbl_microgrids_power_conversion_systems ADD `discharge_end_time2_command_id` BIGINT NOT NULL AFTER `discharge_end_time4_point_id`;
ALTER TABLE myems_system_db.tbl_microgrids_power_conversion_systems ADD `discharge_start_time2_command_id` BIGINT NOT NULL AFTER `discharge_end_time4_point_id`;
ALTER TABLE myems_system_db.tbl_microgrids_power_conversion_systems ADD `discharge_end_time1_command_id` BIGINT NOT NULL AFTER `discharge_end_time4_point_id`;
ALTER TABLE myems_system_db.tbl_microgrids_power_conversion_systems ADD `discharge_start_time1_command_id` BIGINT NOT NULL AFTER `discharge_end_time4_point_id`;
ALTER TABLE myems_system_db.tbl_microgrids_power_conversion_systems ADD `charge_end_time4_command_id` BIGINT NOT NULL AFTER `discharge_end_time4_point_id`;
ALTER TABLE myems_system_db.tbl_microgrids_power_conversion_systems ADD `charge_start_time4_command_id` BIGINT NOT NULL AFTER `discharge_end_time4_point_id`;
ALTER TABLE myems_system_db.tbl_microgrids_power_conversion_systems ADD `charge_end_time3_command_id` BIGINT NOT NULL AFTER `discharge_end_time4_point_id`;
ALTER TABLE myems_system_db.tbl_microgrids_power_conversion_systems ADD `charge_start_time3_command_id` BIGINT NOT NULL AFTER `discharge_end_time4_point_id`;
ALTER TABLE myems_system_db.tbl_microgrids_power_conversion_systems ADD `charge_end_time2_command_id` BIGINT NOT NULL AFTER `discharge_end_time4_point_id`;
ALTER TABLE myems_system_db.tbl_microgrids_power_conversion_systems ADD `charge_start_time2_command_id` BIGINT NOT NULL AFTER `discharge_end_time4_point_id`;
ALTER TABLE myems_system_db.tbl_microgrids_power_conversion_systems ADD `charge_end_time1_command_id` BIGINT NOT NULL AFTER `discharge_end_time4_point_id`;
ALTER TABLE myems_system_db.tbl_microgrids_power_conversion_systems ADD `charge_start_time1_command_id` BIGINT NOT NULL AFTER `discharge_end_time4_point_id`;

-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='3.12.0RC', release_date='2023-12-01' WHERE id=1;

COMMIT;
