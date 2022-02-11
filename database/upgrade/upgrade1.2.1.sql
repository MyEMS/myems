-- ---------------------------------------------------------------------------------------------------------------------
-- WARNING: BACKUP YOUR DATABASE BEFORE UPGRADING
-- THIS SCRIPT IS ONLY FOR UPGRADING 1.2.0 TO 1.2.1
-- THE CURRENT VERSION CAN BE FOUND AT `myems_system_db`.`tbl_versions`
-- ---------------------------------------------------------------------------------------------------------------------

START TRANSACTION;

ALTER TABLE myems_fdd_db.tbl_email_messages ADD rule_id BIGINT NOT NULL AFTER id;
ALTER TABLE myems_fdd_db.tbl_text_messages_outbox ADD rule_id BIGINT NOT NULL AFTER id;
ALTER TABLE myems_fdd_db.tbl_web_messages ADD rule_id BIGINT NOT NULL AFTER id;
ALTER TABLE myems_fdd_db.tbl_wechat_messages_outbox ADD rule_id BIGINT NOT NULL AFTER id;


-- UPDATE VERSION NUMBER
UPDATE `myems_system_db`.`tbl_versions` SET version='1.2.1', release_date='2021-08-19' WHERE id=1;

COMMIT;