START TRANSACTION;

-- UPDATE VERSION NUMBER
UPDATE myems_system_db.tbl_versions SET version='1.6.1', release_date='2022-01-18' WHERE id=1;

COMMIT;