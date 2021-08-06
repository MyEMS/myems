-- MyEMS System Database Demo Data

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_combined_equipments`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_combined_equipments`
(`id`, `name`, `uuid`,  `is_input_counted`, `is_output_counted`, `cost_center_id`, `description` )
VALUES
(1, '组合式设备1', '48aab70f-2e32-4518-9986-a6b7395acf58', true, false, 1, 'description'),
(2, '组合式设备2', 'c235e68c-e1be-4d7a-84e7-976c83ff6e44', true, false, 1,  'description');

COMMIT;


-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_combined_equipments_equipments`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_combined_equipments_equipments`
(`id`, `combined_equipment_id`, `equipment_id`)
VALUES
(1, 1, 1);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_combined_equipments_meters`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_combined_equipments_meters`
(`id`, `combined_equipment_id`, `meter_id`, `is_output`)
VALUES
(1, 1, 1, false);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_combined_equipments_offline_meters`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_combined_equipments_offline_meters`
(`id`, `combined_equipment_id`, `offline_meter_id`, `is_output`)
VALUES
(1, 1, 1, false);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_combined_equipments_parameters`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_combined_equipments_parameters`
(`id`, `combined_equipment_id`, `name`, `parameter_type`, `constant`, `point_id`, `numerator_meter_uuid`, `denominator_meter_uuid`)
VALUES
(1, 1, 'serial number', 'constant', 'bfa8b106', NULL, NULL, NULL),
(2, 1, 'manufacturer', 'constant', 'York', NULL, NULL, NULL),
(3, 1, 'maintainer', 'constant', 'Johnson Controls', NULL, NULL, NULL),
(4, 1, 'use life start', 'constant', '2016-01-01', NULL, NULL, NULL),
(5, 1, 'use life end', 'constant', '2025-12-31', NULL, NULL, NULL),
(6, 1, 'model number', 'constant', 'CH01', NULL, NULL, NULL),
(7, 1, 'nominal cooling capacity', 'constant', '90.000 kW', NULL, NULL, NULL),
(8, 1, 'nominal cooling input power', 'constant', '100.000 kW', NULL, NULL, NULL),
(9, 1, 'nominal cooling cop', 'constant', '5', NULL, NULL, NULL),
(10, 1, 'nominal cooling operating current', 'constant', '120.000 A', NULL, NULL, NULL),
(11, 1, 'rated input power', 'constant', '100.000 kW', NULL, NULL, NULL),
(12, 1, 'nominal chilled water flow rate', 'constant', '30 m2/h', NULL, NULL, NULL),
(13, 1, 'nominal cooling water flow_rate', 'constant', '50 m2/h', NULL, NULL, NULL),
(14, 1, 'status', 'point', NULL, 1, NULL, NULL),
(15, 1, 'inlet chilled water temperature', 'point', NULL, 2, NULL, NULL),
(16, 1, 'chilled_water instantaneous flow rate', 'point', NULL, 3, NULL, NULL),
(17, 1, 'instantaneous power', 'point', NULL, 4, NULL, NULL),
(18, 1, 'COP', 'fraction', NULL, NULL, 'a4e0dbf0-528a-4cbb-88cc-563527900d40', '89ff5118-d0c2-4dd8-8098-a8698189b2ea');

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_combined_equipments_virtual_meters`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_combined_equipments_virtual_meters`
(`id`, `combined_equipment_id`, `virtual_meter_id`, `is_output`)
VALUES
(1, 1, 1, false);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_contacts`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;
INSERT INTO `myems_system_db`.`tbl_contacts`(`id`, `name`, `uuid`, `email`, `phone`, `description`)
VALUES
(1, 'John', '5c5ce6e8-8d00-46b3-9602-4e1520a8b43f',  'john@myems.io', '+8613888888888', 'Building #1'),
(2, 'Sample Tenant', '102b654d-e831-4365-bb1e-dbd55e897851',  'sample.tenant@myems.io', '+8613666666666', 'Sample Tenant');
COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_cost_centers`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_cost_centers`
(`id`, `name`, `uuid`, `external_id`)
VALUES
(1, '成本中心', 'd97b9736-c4f9-4005-a534-6af3487303ad', NULL);
COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_cost_centers_tariffs`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;
INSERT INTO `myems_system_db`.`tbl_cost_centers_tariffs`
(`id`, `cost_center_id`, `tariff_id`)
VALUES
(1, 1, 1),
(2, 1, 2),
(3, 1, 3);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_data_sources`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_data_sources`
(`id`, `name`, `uuid`,`gateway_id`, `protocol`,  `connection`)
VALUES
(1, '示例ModbusTCP数据源', 1, 'b3ace9d4-b63b-419b-818f-0f6d1d0603a4', 'modbus-tcp', '{"host":"10.111.212.191", "port":502}'),
(2, '示例ModbusRTU数据源', 1, 'b903f0af-9115-448c-9d46-8caf5f9995f3', 'modbus-tru', '{"port": "/dev/ttyUSB0","slaveaddress": 1, "baudrate": 9600,"bytesize": 8,"parity": "N","stopbits": 1,"timeout": 0.05,"mode": "rtu"}''),
(3, '示例Bacnet/IP数据源', 1, 'e2d5b30b-b554-4ebe-8ce7-f377ab380d19', 'bacnet-ip', '{"host":"10.111.212.200", "port":47808}'),
(4, '示例S7数据源', 1, '9eb0d705-d02a-43f8-9c62-7e5ef508b255', 's7', '{"host":"10.111.212.202", "port":102, "rack": 0, "slot": 2}'),
(5, '示例ControlLogix数据源', 1, 'd1dc9792-7861-4dd3-9b01-07511dae16c1', 'control-logix', '{"host":"10.111.212.203","port":44818,"processorslot":3}');
(6, '示例OPU UA数据源', 1, '56e1c642-8032-495b-af2e-18a77ca75e0f', 'opc-ua', '{"url":"opc.tcp://10.111.212.5:49320/OPCUA/SimulationServer/"}');
(7, '示例天气数据源', 1, '9bff8e95-c7c9-4002-b040-08a96ae196b5', 'weather', '{"base_url":"WEATHER_API_URL", "location":"beijing", "key":"APPKEY"}');
COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_distribution_circuits`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_distribution_circuits`
(`id`, `name`, `uuid`, `distribution_system_id`, `distribution_room`, `switchgear`, `peak_load`, `peak_current`, `customers`, `meters`)
VALUES
(1, '51W91', '52f7abe1-ba0e-47a6-a327-4faac42a1d11', 1, 'EW1', '51AL9', 30, 53.6, '地下室应急照明', 'ALE-1102, ALE-1082');

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_distribution_circuits_points`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_distribution_circuits_points`
(`id`, `distribution_circuit_id`, `point_id`)
VALUES (1, 1, 1);
COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_distribution_systems`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_distribution_systems`
(`id`, `name`, `uuid`, `svg`,  `description`)
VALUES
(1, '示例配电系统', '95652719-56fa-44cc-9bef-7aa47664d4ff', '<?xml version="1.0" encoding="UTF-8"?><svg width="5cm" height="4cm" version="1.1" xmlns="http://www.w3.org/2000/svg"><desc>Four separate rectangles</desc><rect x=".5cm" y=".5cm" width="2cm" height="1cm"/></svg>', 'demo distribution system');

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_energy_categories`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_energy_categories`
(`id`, `name`, `uuid`, `unit_of_measure`, `kgce`, `kgco2e`)
VALUES
(1, '电', '6d0753ed-8b43-4332-b6fd-d2f5813831d3', 'kWh', 0.1229, 0.928),
(2, '自来水', '3dbfa598-fccc-4d60-bf11-14bd55540c66', 'm³', 0.0857, 0.910),
(3, '天然气', '6d0753ed-8b43-4332-b6fd-d2f5813831d3', 'm³', 1.3300, 2.1622),
(4,'4℃冷冻水','d2a3021a-4911-4611-856e-80133000f1d5','m³',1.000,1.000),
(5,'7℃冷冻水','c1ad0696-e1ab-4e0c-a342-b194c0bc27e0','m³',1.000,1.000),
(6,'蒸汽','ac91a5c4-4ae5-4a73-8e3f-044591f42eef','T',1.000,1.000),
(7,'压缩空气','ff238e98-cd35-47c5-88a3-00617587775d','m³',1.000,1.000),
(8,'循环水','7e159a34-b2e6-4fd3-ba76-897d134abe06','m³',1.000,1.000),
(9, '热量','549f9cad-8db7-49d2-9473-95e37a3fc46a','KJ',1.000,1.000),
(10, '冷量','05aa257b-3cf6-4f19-808d-92e7dbf52b16','KJ',1.000,1.000),
(11, '中水','df6161b6-4a1b-46e7-b7c8-337b5b52d717','m³',1.000,1.000);
COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_energy_items`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_energy_items`
(`id`, `name`, `uuid`, `energy_category_id`)
VALUES
(1, '空调用电', 'c5eac07a-e889-4a56-aa1b-a0b688c4e953', 1),
(2, '动力用电', '6875e4e0-a2ec-47a5-a88e-becb10e9603a', 1),
(3, '照明用电', '79918598-6477-4130-a85c-4cb87d0eac23', 1);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_energy_flow_diagrams`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_energy_flow_diagrams`
(`id`, `name`, `uuid`)
VALUES
(1, '低压配电系统', '3ccbc9c6-9575-4212-a63a-a688d1154302');

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_energy_flow_diagrams_links`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_energy_flow_diagrams_links`
(`id`, `energy_flow_diagram_id`, `name`)
VALUES
(1, 1, 1, 3, '5ca47bc5-22c2-47fc-b906-33222191ea40'),
(2, 1, 2, 4, '5d4d2f06-6200-4671-b182-4cf32cd9228f'),
(3, 1, 2, 5, '7897665b-66ac-481d-9c31-2ab2ecbda16c'),
(4, 1, 2, 6, 'f0c278ec-eb32-4c5e-a35f-88643b00c367'),
(5, 1, 3, 7, '9918aa6c-79e9-4579-8f2e-a76eb9fe4e3e'),
(6, 1, 3, 8, '831cbc8c-1429-4840-946e-f0b389b2253e'),
(7, 1, 4, 9, 'd2fc8464-3f13-42a9-8a57-63f95f677f0f'),
(8, 1, 4, 10, '7e4b3831-887b-40e2-b7f8-4d77c6f206a9');

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_energy_flow_diagrams_nodes`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_energy_flow_diagrams_nodes`
(`id`, `energy_flow_diagram_id`, `name`)
VALUES
(1, 1, '10KV进线#1'),
(2, 1, '10KV进线#2'),
(3, 1, '租区'),
(4, 1, '公区'),
(5, 1, '酒店'),
(6, 1, '车库'),
(7, 1, '餐饮'),
(8, 1, '零售'),
(9, 1, '照明'),
(10, 1, '电梯');

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_equipments`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_equipments`
(`id`, `name`, `uuid`,  `is_input_counted`, `is_output_counted`, `cost_center_id`,  `description` )
VALUES
(1, '设备1', 'bfa8b106-89a1-49ca-9b2b-a481ac41a873', true, false, 1, 'description'),
(2, '设备2', 'ad5798ec-d827-43d9-bf08-fc7516f9c4c8', true, false, 1, 'description');

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_equipments_meters`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_equipments_meters`
(`id`, `equipment_id`, `meter_id`, `is_output`)
VALUES
(1, 1, 1, false);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_equipments_offline_meters`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_equipments_offline_meters`
(`id`, `equipment_id`, `offline_meter_id`, `is_output`)
VALUES
(1, 1, 1, false);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_equipments_parameters`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_equipments_parameters`
(`id`, `equipment_id`, `name`, `parameter_type`, `constant`, `point_id`, `numerator_meter_uuid`, `denominator_meter_uuid`)
VALUES
(1, 1, 'serial number', 'constant', 'bfa8b106', NULL, NULL, NULL),
(2, 1, 'manufacturer', 'constant', 'York', NULL, NULL, NULL),
(3, 1, 'maintainer', 'constant', 'Johnson Controls', NULL, NULL, NULL),
(4, 1, 'use life start', 'constant', '2016-01-01', NULL, NULL, NULL),
(5, 1, 'use life end', 'constant', '2025-12-31', NULL, NULL, NULL),
(6, 1, 'model number', 'constant', 'CH01', NULL, NULL, NULL),
(7, 1, 'nominal cooling capacity', 'constant', '90.000 kW', NULL, NULL, NULL),
(8, 1, 'nominal cooling input power', 'constant', '100.000 kW', NULL, NULL, NULL),
(9, 1, 'nominal cooling cop', 'constant', '5', NULL, NULL, NULL),
(10, 1, 'nominal cooling operating current', 'constant', '120.000 A', NULL, NULL, NULL),
(11, 1, 'rated input power', 'constant', '100.000 kW', NULL, NULL, NULL),
(12, 1, 'nominal chilled water flow rate', 'constant', '30 m2/h', NULL, NULL, NULL),
(13, 1, 'nominal cooling water flow_rate', 'constant', '50 m2/h', NULL, NULL, NULL),
(14, 1, 'status', 'point', NULL, 1, NULL, NULL),
(15, 1, 'inlet chilled water temperature', 'point', NULL, 2, NULL, NULL),
(16, 1, 'chilled_water instantaneous flow rate', 'point', NULL, 3, NULL, NULL),
(17, 1, 'instantaneous power', 'point', NULL, 4, NULL, NULL),
(18, 1, 'COP', 'fraction', NULL, NULL, 'a4e0dbf0-528a-4cbb-88cc-563527900d40', '89ff5118-d0c2-4dd8-8098-a8698189b2ea');

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_equipments_virtual_meters`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_equipments_virtual_meters`
(`id`, `equipment_id`, `virtual_meter_id`, `is_output`)
VALUES
(1, 1, 1, false);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_expressions`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_expressions`
(`id`, `uuid`, `virtual_meter_id`, `equation`)
VALUES
(1, '3fff2cfb-f755-44c8-a919-6135205a8573', 1, 'x1+x2-x3');
COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_gateways`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_gateways`
(`id`, `name`, `uuid`, `token`,  `last_seen_datetime_utc`)
VALUES
(1, 'MyEMS Gateway 1', 'dc681934-5053-4660-98ed-266c54227231', '983427af-1c35-42ba-8b4d-288675550225', null),
(2, 'MyEMS Gateway 2', '8f75c0ab-9296-49c7-9058-8139febd0c31', 'd3860971-e6e0-4c98-9eba-5492869c5b19', null);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_knowledge_files`
-- ---------------------------------------------------------------------------------------------------------------------

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_meters`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_meters`
(`id`, `name`, `uuid`, `energy_category_id`, `is_counted`, `hourly_low_limit`, `hourly_high_limit`, `cost_center_id`, `energy_item_id`, `master_meter_id`, `description`)
VALUES
(1, '示例表1', '5ca47bc5-22c2-47fc-b906-33222191ea40', 1, true, 0.000, 999.999, 1, 1, null, 'meter1'),
(2, '示例表2', '5ca47bc5-22c2-47fc-b906-33222191ea40', 1, true, 0.000, 999.999, 1, 1, 1,  'meter2'),
(3, '示例表3', '6db58cd6-33d3-58ed-a095-22333202fb51', 1, true, 0.000, 999.999, 1, 1, 1,  'meter3');

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_meters_points`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_meters_points`
(`id`, `meter_id`, `point_id`)
VALUES (1, 1, 1);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_offline_meters`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_offline_meters`
(`id`, `name`, `uuid`, `energy_category_id`, `is_counted`, `max_hourly_value`, `cost_center_id`, `energy_item_id`, `description`)
VALUES
(1, '示例离线表', '62f473e0-1a35-41f3-9c30-8110d75d65bb', 1, true, 999.99, 1, 1, 'offlinemeter1');

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_points`
-- ---------------------------------------------------------------------------------------------------------------------
-- List of Object Type
-- ENERGY_VALUE
-- ANALOG_VALUE
-- DIGITAL_VALUE

START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_points`
(`id`, `name`, `data_source_id`, `object_type`, `units`, `high_limit`, `low_limit`, `ratio`, `is_trend`, `address`, `description` )
VALUES
(1, 'Active Energy Import Tariff 1', 1, 'ENERGY_VALUE', 'kWh', 99999999999, 0, 1.000, true,
  '{\"slave_id\":1, \"function_code\":3, \"offset\":801, \"number_of_registers\":4, \"format\":\"=d\", \"swap_adjacent_bytes\":false}', null),

(2, 'Working hours counter', 1, 'ANALOG_VALUE',  'S', 999999999, 0, 1.000, true,
  '{\"slave_id\":1, \"function_code\":3, \"offset\":209, \"number_of_registers\":2, \"format\":\"=L\", \"swap_adjacent_bytes\":true}', null),

(3, 'Current a', 1, 'ANALOG_VALUE',  'A', 5, 0, 1.000, true,
  '{\"slave_id\":1, \"function_code\":3, \"offset\":13, \"number_of_registers\":2, \"format\":\"=f\", \"swap_adjacent_bytes\":false}', null),

(4, 'Active Power a', 1, 'ANALOG_VALUE',  'W', 3450, 0, 1.000, true,
  '{\"slave_id\":1, \"function_code\":3, \"offset\":25, \"number_of_registers\":2, \"format\":\"=f\", \"swap_adjacent_bytes\":false}', null),

(5, 'Power Factor a', 1, 'ANALOG_VALUE',  'W', 1, 0, 1.000, true,
  '{\"slave_id\":1, \"function_code\":3, \"offset\":37, \"number_of_registers\":2, \"format\":\"=f\", \"swap_adjacent_bytes\":false}', null),

(6, '示例ModbusTCP数据点6', 2, 'ENERGY_VALUE',  'Wh', 99999999999, 0, 1.000, true,
  '{\"slave_id\":1, \"function_code\":3, \"offset\":40001, \"number_of_registers\":2, \"format\":\"=f\", \"swap_adjacent_bytes\":false}', null),

(7, '示例数据点7', 2, 'ANALOG_VALUE',  'V', 690, 0, 1.000, true,
  '{\"slave_id\":1, \"function_code\":3, \"offset\":40002, \"number_of_registers\":2, \"format\":\"=f\", \"swap_adjacent_bytes\":false}', null),

(8, 'BACnet示例数据点1', 3, 'ANALOG_VALUE',  'V', 690, 0, 1.000, true,
  '{\"object_type\":\"analogValue\", \"object_id\":3004860, \"property_name\":\"presentValue\", \"property_array_index\":null}', null),
-- BACnet Object Type
-- analogValue, analogInput, analogOutput, binaryValue, binaryInput, binaryOutput

(9, 'S7示例数据点1', 4, 'ANALOG_VALUE',  'kWh', 99999999999, 0, 1.000, true,
  '{\"area\":\"DB\", \"db_number\":700, \"start\":8, \"size\":4', null);
-- # S7 Area
-- 'PE', 'PA', 'MK', 'DB', 'CT', 'TM'

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_sensors`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_sensors`
(`id`, `name`, `uuid`, `description`)
VALUES
(1, '示例传感器', 'ba450606-6f39-41e0-8caf-75b528635511', 'sensor description');

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_sensors_points`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_sensors_points`
(`id`, `sensor_id`, `point_id`)
VALUES (1, 1, 1);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_shopfloors`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_shopfloors`
(`id`, `name`, `uuid` , `area`, `contact_id`, `is_input_counted`,  `cost_center_id`, `description`)
VALUES
(1, 'MyEMS Shopfloor', 'd03837fd-9d30-44fe-9443-154f7c7e15f1',  99999.999, 1, true, 1,  'MyEMS Project');
COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_shopfloors_equipments`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_shopfloors_equipments`
(`id`, `shopfloor_id`, `equipment_id`)
VALUES
(1, 1, 1);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_shopfloors_meters`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_shopfloors_meters`
(`id`, `shopfloor_id`, `meter_id`)
VALUES
(1, 1, 1);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_shopfloors_offline_meters`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_shopfloors_offline_meters`
(`id`, `shopfloor_id`, `offline_meter_id`)
VALUES
(1, 1, 1);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_shopfloors_sensors`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_shopfloors_sensors`
(`id`, `shopfloor_id`, `sensor_id`)
VALUES
(1, 1, 1);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_shopfloors_virtual_meters`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_shopfloors_virtual_meters`
(`id`, `shopfloor_id`, `virtual_meter_id`)
VALUES
(1, 1, 1);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_shopfloors_points`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_shopfloors_points`
(`id`, `shopfloor_id`, `point_id`)
VALUES
(1, 3, 2000001),
(2, 3, 2000002),
(3, 3, 2000003),
(4, 3, 2000006);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_spaces`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_spaces`
(`id`, `name`, `uuid`, `parent_space_id`, `area`, `timezone_id`, `contact_id`, `is_input_counted`, `is_output_counted`, `cost_center_id`, `description`)
VALUES
(2, 'MyEMS Building #1', '8f25b33b-db93-49b3-b0f8-b01e0c19df29', 1, 88888.888, 56, 1, true, true, 1,  'MyEMS Project'),
(3, 'MyEMS Building #2', '195d7ea8-17b4-4e9c-bb37-546428155438', 1, 66666.666, 56, 1, true, true, 1, 'MyEMS Project');
COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_spaces_combined_equipments`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_spaces_combined_equipments`
(`id`, `space_id`, `combined_equipment_id`)
VALUES
(1, 1, 1);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_spaces_equipments`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_spaces_equipments`
(`id`, `space_id`, `equipment_id`)
VALUES
(1, 1, 1);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_spaces_meters`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_spaces_meters`
(`id`, `space_id`, `meter_id`)
VALUES
(1, 1, 1);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_spaces_offline_meters`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_spaces_offline_meters`
(`id`, `space_id`, `offline_meter_id`)
VALUES
(1, 1, 1);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_spaces_sensors`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_spaces_sensors`
(`id`, `space_id`, `sensor_id`)
VALUES
(1, 1, 1);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_spaces_shopfloors`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_spaces_shopfloors`
(`id`, `space_id`, `shopfloor_id`)
VALUES
(1, 1, 1);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_spaces_stores`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_spaces_stores`
(`id`, `space_id`, `store_id`)
VALUES
(1, 1, 1);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_spaces_tenants`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_spaces_tenants`
(`id`, `space_id`, `tenant_id`)
VALUES
(1, 1, 1);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_spaces_virtual_meters`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_spaces_virtual_meters`
(`id`, `space_id`, `virtual_meter_id`)
VALUES
(1, 1, 1);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_spaces_points`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_spaces_points`
(`id`, `space_id`, `point_id`)
VALUES
(1, 3, 2000001),
(2, 3, 2000002),
(3, 3, 2000003),
(4, 3, 2000006);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_tariffs`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_tariffs`
(`id`, `name`, `uuid`, `energy_category_id`, `tariff_type`, `unit_of_price`, `valid_from_datetime_utc`, `valid_through_datetime_utc`)
VALUES
(1, '2020分时电价1-6',    '590efb36-8587-42a9-ae6f-c715d21496d6', 1, 'timeofuse', '元/千瓦时', '2019-12-31 16:00:00', '2020-06-30 15:59:59'),
(2, '2020分时电价7-9',    'f5966640-18fc-437a-9efd-cbc0c58b6373', 1, 'timeofuse', '元/千瓦时', '2020-06-30 16:00:00', '2020-09-30 15:59:59'),
(3, '2020分时电价10-12',  '21727a1b-4b27-4186-b72e-db46e6e2d980', 1, 'timeofuse', '元/千瓦时', '2020-09-30 16:00:00', '2020-12-31 15:59:59'),
(4, '2021分时电价1-6',    'fe65e443-0ec2-4a16-823e-2365885e2598', 1, 'timeofuse', '元/千瓦时', '2020-12-31 16:00:00', '2021-06-30 15:59:59'),
(5, '2021分时电价7-9',    'd1285c81-4612-4d7c-9436-ed11b4e7abe4', 1, 'timeofuse', '元/千瓦时', '2021-06-30 16:00:00', '2021-09-30 15:59:59'),
(6, '2021分时电价10-12',  'e6c275b4-47eb-4f5d-bc59-edbe45c2a407', 1, 'timeofuse', '元/千瓦时', '2021-09-30 16:00:00', '2021-12-31 15:59:59'),
(7, '2022分时电价1-6',    'ca359f72-48ad-46a7-82af-cecbe98450e8', 1, 'timeofuse', '元/千瓦时', '2021-12-31 16:00:00', '2022-06-30 15:59:59'),
(8, '2022分时电价7-9',    '9fdda603-0f8f-4452-ad59-c5df54bc35f4', 1, 'timeofuse', '元/千瓦时', '2022-06-30 16:00:00', '2022-09-30 15:59:59'),
(9, '2022分时电价10-12',  'fb0442e7-4d44-4bfd-8b20-cad3f77a2480', 1, 'timeofuse', '元/千瓦时', '2022-09-30 16:00:00', '2022-12-31 15:59:59'),
(10, '2023分时电价1-6',   '3fa6e1f2-7d08-4f5a-bcbf-beb041d569c0', 1, 'timeofuse', '元/千瓦时', '2022-12-31 16:00:00', '2023-06-30 15:59:59'),
(11, '2023分时电价7-9',   '787240fb-1694-403e-a0a7-83d7be1cc0b8', 1, 'timeofuse', '元/千瓦时', '2023-06-30 16:00:00', '2023-09-30 15:59:59'),
(12, '2023分时电价10-12', 'a07fdf76-edcf-4124-96e7-ab733a5a4b70', 1, 'timeofuse', '元/千瓦时', '2023-09-30 16:00:00', '2023-12-31 15:59:59'),
(13, '自来水',  '6fcbc77e-effb-4d43-9b30-77b062435d34', 2, 'timeofuse', '元/m³',    '2019-12-31 16:00:00', '2023-12-31 15:59:59'),
(14, '天然气', '6a4c56ff-b3e1-4555-9b1c-87d05bcfa4d9', 3, 'timeofuse', '元/m³',    '2019-12-31 16:00:00', '2023-12-31 15:59:59'),
(15, '分量阶梯电价', 'd1b81d2f-d387-43d3-affd-d796b7236b60', 1, 'block',     '元/千瓦时', '2019-12-31 16:00:00', '2023-12-31 15:59:59');

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_tariffs_timeofuses`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_tariffs_timeofuses`
(`id`, `tariff_id`, `start_time_of_day`, `end_time_of_day`, `peak_type`, `price`)
VALUES
-- '2020分时电价1-6'
(1,  1, '00:00:00', '05:59:59', 'offpeak', 0.345),
(2,  1, '06:00:00', '07:59:59', 'midpeak', 0.708),
(3,  1, '08:00:00', '10:59:59', 'onpeak', 1.159),
(4,  1, '11:00:00', '17:59:59', 'midpeak', 0.708),
(5,  1, '18:00:00', '20:59:59', 'onpeak', 1.159),
(6,  1, '21:00:00', '21:59:59', 'midpeak', 0.708),
(7,  1, '22:00:00', '23:59:59', 'offpeak', 0.345),
-- '2020分时电价7-9'
(8,  2, '00:00:00', '05:59:59', 'offpeak', 0.345),
(9,  2, '06:00:00', '07:59:59', 'midpeak', 0.708),
(10, 2, '08:00:00', '10:59:59', 'offpeak', 1.159),
(11, 2, '11:00:00', '12:59:59', 'midpeak', 0.708),
(12, 2, '13:00:00', '14:59:59', 'onpeak', 1.159),
(13, 2, '15:00:00', '17:59:59', 'midpeak', 0.708),
(14, 2, '18:00:00', '20:59:59', 'onpeak', 1.159),
(15, 2, '21:00:00', '21:59:59', 'midpeak', 0.708),
(16, 2, '22:00:00', '23:59:59', 'offpeak', 0.345),
-- '2020分时电价10-12'
(17, 3, '00:00:00', '05:59:59', 'offpeak', 0.345),
(18, 3, '06:00:00', '07:59:59', 'midpeak', 0.708),
(19, 3, '08:00:00', '10:59:59', 'onpeak', 1.159),
(20, 3, '11:00:00', '17:59:59', 'midpeak', 0.708),
(21, 3, '18:00:00', '20:59:59', 'onpeak', 1.159),
(22, 3, '21:00:00', '21:59:59', 'midpeak', 0.708),
(23, 3, '22:00:00', '23:59:59', 'offpeak', 0.345),
-- '2021分时电价1-6'
(24, 4, '00:00:00', '05:59:59', 'offpeak', 0.345),
(25, 4, '06:00:00', '07:59:59', 'midpeak', 0.708),
(26, 4, '08:00:00', '10:59:59', 'onpeak', 1.159),
(27, 4, '11:00:00', '17:59:59', 'midpeak', 0.708),
(28, 4, '18:00:00', '20:59:59', 'onpeak', 1.159),
(29, 4, '21:00:00', '21:59:59', 'midpeak', 0.708),
(30, 4, '22:00:00', '23:59:59', 'offpeak', 0.345),
-- '2021分时电价7-9'
(31, 5, '00:00:00', '05:59:59', 'offpeak', 0.345),
(32, 5, '06:00:00', '07:59:59', 'midpeak', 0.708),
(33, 5, '08:00:00', '10:59:59', 'offpeak', 1.159),
(34, 5, '11:00:00', '12:59:59', 'midpeak', 0.708),
(35, 5, '13:00:00', '14:59:59', 'onpeak', 1.159),
(36, 5, '15:00:00', '17:59:59', 'midpeak', 0.708),
(37, 5, '18:00:00', '20:59:59', 'onpeak', 1.159),
(38, 5, '21:00:00', '21:59:59', 'midpeak', 0.708),
(39, 5, '22:00:00', '23:59:59', 'offpeak', 0.345),
-- '2021分时电价10-12'
(40, 6, '00:00:00', '05:59:59', 'offpeak', 0.345),
(41, 6, '06:00:00', '07:59:59', 'midpeak', 0.708),
(42, 6, '08:00:00', '10:59:59', 'onpeak', 1.159),
(43, 6, '11:00:00', '17:59:59', 'midpeak', 0.708),
(44, 6, '18:00:00', '20:59:59', 'onpeak', 1.159),
(45, 6, '21:00:00', '21:59:59', 'midpeak', 0.708),
(46, 6, '22:00:00', '23:59:59', 'offpeak', 0.345),
-- '2022分时电价1-6'
(47, 7, '00:00:00', '05:59:59', 'offpeak', 0.345),
(48, 7, '06:00:00', '07:59:59', 'midpeak', 0.708),
(49, 7, '08:00:00', '10:59:59', 'onpeak', 1.159),
(50, 7, '11:00:00', '17:59:59', 'midpeak', 0.708),
(51, 7, '18:00:00', '20:59:59', 'onpeak', 1.159),
(52, 7, '21:00:00', '21:59:59', 'midpeak', 0.708),
(53, 7, '22:00:00', '23:59:59', 'offpeak', 0.345),
-- '2022分时电价7-9'
(54, 8, '00:00:00', '05:59:59', 'offpeak', 0.345),
(55, 8, '06:00:00', '07:59:59', 'midpeak', 0.708),
(56, 8, '08:00:00', '10:59:59', 'offpeak', 1.159),
(57, 8, '11:00:00', '12:59:59', 'midpeak', 0.708),
(58, 8, '13:00:00', '14:59:59', 'onpeak', 1.159),
(59, 8, '15:00:00', '17:59:59', 'midpeak', 0.708),
(60, 8, '18:00:00', '20:59:59', 'onpeak', 1.159),
(61, 8, '21:00:00', '21:59:59', 'midpeak', 0.708),
(62, 8, '22:00:00', '23:59:59', 'offpeak', 0.345),
-- '2022分时电价10-12'
(63, 9, '00:00:00', '05:59:59', 'offpeak', 0.345),
(64, 9, '06:00:00', '07:59:59', 'midpeak', 0.708),
(65, 9, '08:00:00', '10:59:59', 'onpeak', 1.159),
(66, 9, '11:00:00', '17:59:59', 'midpeak', 0.708),
(67, 9, '18:00:00', '20:59:59', 'onpeak', 1.159),
(68, 9, '21:00:00', '21:59:59', 'midpeak', 0.708),
(69, 9, '22:00:00', '23:59:59', 'offpeak', 0.345),
-- '2023分时电价1-6'
(70, 10, '00:00:00', '05:59:59', 'offpeak', 0.345),
(71, 10, '06:00:00', '07:59:59', 'midpeak', 0.708),
(72, 10, '08:00:00', '10:59:59', 'onpeak', 1.159),
(73, 10, '11:00:00', '17:59:59', 'midpeak', 0.708),
(74, 10, '18:00:00', '20:59:59', 'onpeak', 1.159),
(75, 10, '21:00:00', '21:59:59', 'midpeak', 0.708),
(76, 10, '22:00:00', '23:59:59', 'offpeak', 0.345),
-- '2023分时电价7-9'
(77, 11, '00:00:00', '05:59:59', 'offpeak', 0.345),
(78, 11, '06:00:00', '07:59:59', 'midpeak', 0.708),
(79, 11, '08:00:00', '10:59:59', 'offpeak', 1.159),
(80, 11, '11:00:00', '12:59:59', 'midpeak', 0.708),
(81, 11, '13:00:00', '14:59:59', 'onpeak', 1.159),
(82, 11, '15:00:00', '17:59:59', 'midpeak', 0.708),
(83, 11, '18:00:00', '20:59:59', 'onpeak', 1.159),
(84, 11, '21:00:00', '21:59:59', 'midpeak', 0.708),
(85, 11, '22:00:00', '23:59:59', 'offpeak', 0.345),
-- '2023分时电价10-12'
(86, 12, '00:00:00', '05:59:59', 'offpeak', 0.345),
(87, 12, '06:00:00', '07:59:59', 'midpeak', 0.708),
(88, 12, '08:00:00', '10:59:59', 'onpeak', 1.159),
(89, 12, '11:00:00', '17:59:59', 'midpeak', 0.708),
(90, 12, '18:00:00', '20:59:59', 'onpeak', 1.159),
(91, 12, '21:00:00', '21:59:59', 'midpeak', 0.708),
(92, 12, '22:00:00', '23:59:59', 'offpeak', 0.345),
-- '自来水'
-- 'Water'
(93, 13, '00:00:00', '23:59:59', 'midpeak', 5.95),
-- '天然气'
-- 'Natual Gas'
(94, 14, '00:00:00', '23:59:59', 'midpeak', 3.50);
COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_tariffs_blocks`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_tariffs_blocks`
(`id`, `tariff_id`, `start_amount`, `end_amount`, `price`)
VALUES
-- '分量阶梯电价'
-- 'Block tariff of electrical'
(1, 15, 0, 10000, 0.345),
(2, 15, 10000, 30000, 0.456),
(3, 15, 30000, 100000, 0.567),
(4, 15, 100000, 1000000000, 0.678);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_stores`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_stores`
(`id`, `name`, `uuid`, `address`, `latitude`, `longitude`, `area`, `store_type_id`, `is_input_counted`, `contact_id`, `cost_center_id`, `description`)
VALUES
(1, '麦当劳(祈年大街得来速店)', 'd8a24322-4bab-4ba2-aedc-5d55a84c3db8', '北京市东城区东打磨厂街7号', 39.899493, 116.412041, 500.000, 1, true, 1, 1,  'MacDonalds');
COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_store_types`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_store_types`
(`id`, `name`, `uuid`, `description`, `simplified_code`)
VALUES
(1, 'Restaurant', '494d7d5e-e139-4629-b957-99ea4caf0401', '餐饮', 'RS'),
(2, 'Retail', '1f556579-9d5c-45ce-9bd8-f2dc1d033470', '零售', 'RT'),
(3, 'Hotel', 'cae697aa-ceca-435d-91bf-492b46607eb0', '酒店', 'HT');

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_stores_meters`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_stores_meters`
(`id`, `store_id`, `meter_id`)
VALUES
(1, 1, 1);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_stores_offline_meters`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_stores_offline_meters`
(`id`, `store_id`, `offline_meter_id`)
VALUES
(1, 1, 1);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_stores_points`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_stores_points`
(`id`, store_id`, `point_id`)
VALUES
(1, 3, 2000001),
(2, 3, 2000002),
(3, 3, 2000003),
(4, 3, 2000006);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_stores_sensors`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_stores_sensors`
(`id`, `store_id`, `sensor_id`)
VALUES
(1, 1, 1);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_stores_virtual_meters`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_stores_virtual_meters`
(`id`, `store_id`, `virtual_meter_id`)
VALUES
(1, 1, 1);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_tenants`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_tenants`
(`id`, `name`, `uuid`, `buildings`, `floors`, `rooms`, `area`, `tenant_type_id`, `is_input_counted`, `is_key_tenant`,
   `lease_number`, `lease_start_datetime_utc`, `lease_end_datetime_utc`, `is_in_lease`, `contact_id`, `cost_center_id`, `description`)
VALUES
(1, 'Starbucks星巴克', '6b0da806-a4cd-431a-8116-2915e90aaf8b', 'Building #1', 'L1 L2 L3', '1201b+2247+3F', 418.8, 9, true, true,
 '6b0da806',  '2019-12-31 16:00:00', '2022-12-31 16:00:00', true, 1, 1,  'my description');
COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_tenant_types`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_tenant_types`
(`id`, `name`, `uuid`, `description`, `simplified_code`)
VALUES
(1, '餐饮租户', '83fffba1-9e22-4397-a93a-3742772c3753', 'Food and Beverage', 'FNB'),
(2, '燃气餐饮租户', 'ad95ed16-1c57-49a9-a85e-71e389393089', 'Food and Beverage (Gas)', 'FNBGas'),
(3, '电餐饮租户', '1dc21e83-4333-40f8-9e25-ea049becba37', 'Food and Beverage (Electrical)', 'FNBElec'),
(4, '高照度租户', '4208a60d-d8e6-4fe5-8cea-a55109e9b397', 'High Illuminance Tenant', 'HighIllu'),
(5, '主力租户', 'fc4ae534-544a-4a22-b83b-9f4aa99494aa', 'Anchor Tenant', 'ANCH'),
(6, '普通商业租户', '6d1dca30-1cbe-463d-8a78-cdd5e0f8ac8b', 'Normal Tenant', 'Normal'),
(7, '其他商业租户', '2078e1c0-3936-4ae7-9253-08e0aa1d84b6', 'Other Retail Tenants', 'Other'),
(8, '整层办公租户', 'b2a580a3-edc9-4838-ae1d-7b7265860a9a', 'Whole Floor Office Tenant', 'WhFlr'),
(9, '非整层办公租户', '55bbcba7-d8a0-44a0-9a9f-2f085e3cb044', 'None-Whole Floor Office Tenant', 'NonWhFlr');

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_tenants_meters`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_tenants_meters`
(`id`, `tenant_id`, `meter_id`)
VALUES
(1, 1, 1);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_tenants_offline_meters`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_tenants_offline_meters`
(`id`, `tenant_id`, `offline_meter_id`)
VALUES
(1, 1, 1);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_tenants_points`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_tenants_points`
(`id`, tenant_id`, `point_id`)
VALUES
(1, 3, 2000001),
(2, 3, 2000002),
(3, 3, 2000003),
(4, 3, 2000006);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_tenants_sensors`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_tenants_sensors`
(`id`, `tenant_id`, `sensor_id`)
VALUES
(1, 1, 1);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_tenants_virtual_meters`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_tenants_virtual_meters`
(`id`, `tenant_id`, `virtual_meter_id`)
VALUES
(1, 1, 1);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_virtual_meters`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;

INSERT INTO `myems_system_db`.`tbl_virtual_meters`
(`id`, `name`, `uuid`, `energy_category_id`, `is_counted`, `cost_center_id`, `energy_item_id`, `description`)
VALUES
(1, '示例虚拟表', '3fff2cfb-f755-44c8-a919-6135205a8573', 1, true, 1, 1, `virtual description`);

COMMIT;

-- ---------------------------------------------------------------------------------------------------------------------
-- Demo Data for table `myems_system_db`.`tbl_variables`
-- ---------------------------------------------------------------------------------------------------------------------
START TRANSACTION;
USE `myems_system_db`;
-- meter_type = {'meter', 'virtual_meter', 'offline_meter'}
INSERT INTO `myems_system_db`.`tbl_variables`
(`id`, `name`, `expression_id`, `meter_type`, `meter_id`)
VALUES
(1, 'x', 1, 'meter', 1),
(2, 'y', 1, 'meter', 2),
(3, 'z', 1, 'meter', 3);

COMMIT;

