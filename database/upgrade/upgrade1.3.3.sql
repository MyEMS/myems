-- PLEASE CHECK YOUR DATABASE TABLES BELOW, IF rule_id IS MISSING, THEN RUN BELOW STATEMENTS
-- IF rule_id EXISTS, THEN IGNORE THESE STATEMENTS
ALTER TABLE myems_fdd_db.tbl_email_messages ADD rule_id BIGINT NOT NULL AFTER id;
ALTER TABLE myems_fdd_db.tbl_text_messages_outbox ADD rule_id BIGINT NOT NULL AFTER id;
ALTER TABLE myems_fdd_db.tbl_web_messages ADD rule_id BIGINT NOT NULL AFTER id;
ALTER TABLE myems_fdd_db.tbl_wechat_messages_outbox ADD rule_id BIGINT NOT NULL AFTER id;


-- UPDATE VERSION NUMBER
UPDATE myems_system_db.tbl_versions SET version='1.3.3', release_date='2021-10-30' WHERE id=1;
