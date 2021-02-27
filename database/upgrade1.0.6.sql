-- NOTE: this upgrade script will drop existing data table

DROP TABLE IF EXISTS `myems_system_db`.`tbl_energy_flow_diagrams_links` ;

CREATE TABLE IF NOT EXISTS `myems_system_db`.`tbl_energy_flow_diagrams_links` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `energy_flow_diagram_id` BIGINT NOT NULL,
  `source_node_id` BIGINT NOT NULL,
  `target_node_id` BIGINT NOT NULL,
  `value_object_type` VARCHAR(32) NOT NULL COMMENT 'meter, offline_meter, virtual_meter, space',
  `value_object_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`));
CREATE INDEX `tbl_energy_flow_diagrams_links_index_1` ON  `myems_system_db`.`tbl_energy_flow_diagrams_links`   (`energy_flow_diagram_id`);

-- UPDATE VERSION NUMBER
UPDATE myems_system_db.tbl_versions SET version='1.0.6', release_date='2021-02-27' WHERE id=1;
