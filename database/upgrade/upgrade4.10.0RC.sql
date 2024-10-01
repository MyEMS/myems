ALTER TABLE myems_system_db.tbl_points
ADD `offset_constant` DECIMAL(18, 3) DEFAULT 0.000 NOT NULL AFTER `ratio`;