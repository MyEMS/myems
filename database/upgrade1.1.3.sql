-- UPDATE POINT TABLE
ALTER TABLE myems_system_db.tbl_points MODIFY COLUMN low_limit decimal(18,3) NOT NULL;
ALTER TABLE myems_system_db.tbl_points ADD is_virtual BOOL DEFAULT FALSE NOT NULL;
ALTER TABLE myems_system_db.tbl_points CHANGE is_virtual is_virtual BOOL DEFAULT FALSE NOT NULL AFTER is_trend;


-- UPDATE VERSION NUMBER
UPDATE myems_system_db.tbl_versions SET version='1.1.3', release_date='2021-05-05' WHERE id=1;
