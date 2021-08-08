
-- UPDATE VERSION NUMBER
UPDATE myems_system_db.tbl_versions SET version='1.1.1', release_date='2021-03-31' WHERE id=1;

ALTER TABLE myems_fdd_db.tbl_rules ADD last_run_datetime_utc DATETIME NULL;
ALTER TABLE myems_fdd_db.tbl_rules ADD next_run_datetime_utc DATETIME NULL;
