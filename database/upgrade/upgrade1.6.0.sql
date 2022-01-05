START TRANSACTION;

-- UPDATE VERSION NUMBER
UPDATE myems_system_db.tbl_versions SET version='1.6.0', release_date='2021-12-31' WHERE id=1;

COMMIT;