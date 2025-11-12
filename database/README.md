# MyEMS 数据库设计文档

> 本文档面向程序员，详细说明 MyEMS 能源管理系统的数据库架构、表结构和设计理念。

## 目录

- [系统概述](#系统概述)
- [数据库架构设计](#数据库架构设计)
- [数据库详细说明](#数据库详细说明)
- [数据流转关系](#数据流转关系)
- [表结构设计规范](#表结构设计规范)
- [开发注意事项](#开发注意事项)
- [安装与升级](#安装与升级)

---

## 系统概述

MyEMS (My Energy Management System) 是一个行业领先的开源能源管理系统，参考 ISO 50001 能源管理体系标准 (GB/T 23331-2020)，适用于建筑、工厂、商场、医院、园区等场景的能源和碳排放采集、分析、报表。

### 系统模块

MyEMS 采用微服务架构，主要包含以下模块：

- **myems-api**: RESTful API 服务 (Python + Falcon)
- **myems-admin**: 管理后台 UI (AngularJS)
- **myems-web**: 用户 Web 界面 (ReactJS)
- **myems-modbus-tcp**: Modbus TCP 数据采集服务
- **myems-normalization**: 数据规范化服务
- **myems-cleaning**: 数据清洗服务
- **myems-aggregation**: 数据汇总服务（能耗、计费、碳排放计算）

### 数据库概览

MyEMS 采用**多数据库分离架构**，将不同类型的数据存储在不同的数据库中，以提高性能、便于维护和扩展。系统共包含 **13 个数据库**：

| 数据库名称 | 用途 | 主要功能 | 数据量级 |
|-----------|------|----------|---------|
| `myems_system_db` | 系统配置数据库 | 存储系统配置、设备信息、用户权限等基础数据 | 中小型 |
| `myems_historical_db` | 历史数据数据库 | 存储实时监测数据、历史数据、成本文件等 | **大型** |
| `myems_energy_db` | 能耗数据库 | 存储各种设备的能耗统计数据（按小时、日、月、年） | **大型** |
| `myems_billing_db` | 计费数据库 | 存储计费相关的能耗数据 | **大型** |
| `myems_carbon_db` | 碳排放数据库 | 存储碳排放相关的能耗数据 | **大型** |
| `myems_energy_baseline_db` | 能耗基线数据库 | 存储能耗基线数据，用于节能分析 | 中型 |
| `myems_energy_model_db` | 能耗模型数据库 | 存储8760小时年度能耗模型数据 | 中型 |
| `myems_energy_plan_db` | 能耗计划数据库 | 存储能耗计划和目标数据 | 中型 |
| `myems_energy_prediction_db` | 能耗预测数据库 | 存储能耗预测数据 | 中型 |
| `myems_fdd_db` | 故障诊断数据库 | 存储故障检测和诊断相关数据 | 中型 |
| `myems_user_db` | 用户数据库 | 存储用户认证、API密钥、邮件消息等 | 小型 |
| `myems_reporting_db` | 报告数据库 | 存储报告相关的邮件消息和附件 | 小型 |
| `myems_production_db` | 生产数据库 | 存储生产相关的产品数据 | 小型 |

---

## 数据库架构设计

### 设计理念

1. **数据分离**: 按数据类型和用途分离到不同数据库，避免单库过大
2. **读写分离**: 历史数据采用时间序列存储，支持高效查询
3. **水平扩展**: 大型数据库（historical_db, energy_db）可独立扩展
4. **统一规范**: 所有数据库使用相同的字符集和排序规则

### 数据库配置

所有数据库统一使用以下配置：

- **字符集**: `utf8mb4` (支持完整的 UTF-8 字符，包括 emoji)
- **排序规则**: `utf8mb4_unicode_ci` (Unicode 排序规则)
- **存储引擎**: InnoDB (默认，支持事务和外键)

### 命名规范

- **数据库命名**: `myems_{功能}_db` (小写，下划线分隔)
- **表命名**: `tbl_{实体名}` (小写，下划线分隔)
- **字段命名**: 小写，下划线分隔，如 `start_datetime_utc`
- **索引命名**: `tbl_{表名}_index_{序号}`

---

## 数据库详细说明

### 1. myems_system_db (系统配置数据库)

**用途**: 存储系统的基础配置和元数据，是整个系统的核心配置库。

**特点**:
- 包含最多的表（约 150+ 张表）
- 数据量相对较小，但结构复杂
- 包含大量的关联关系表

**主要表分类**:

#### 1.1 基础配置表

| 表名 | 说明 | 关键字段 |
|------|------|----------|
| `tbl_energy_categories` | 能源分类（电、水、气、冷、热等） | `id`, `name`, `unit_of_measure`, `kgce`, `kgco2e` |
| `tbl_energy_items` | 能耗分项（照明、空调、动力等） | `id`, `name`, `energy_category_id` |
| `tbl_cost_centers` | 成本中心 | `id`, `name`, `external_id` |
| `tbl_data_sources` | 数据源配置 | `id`, `name`, `gateway_id`, `protocol`, `connection` |
| `tbl_protocols` | 协议配置 | `id`, `name`, `protocol_type` |

#### 1.2 设备管理表

| 表名 | 说明 | 关键字段 |
|------|------|----------|
| `tbl_equipments` | 设备信息 | `id`, `name`, `uuid`, `equipment_type_id`, `cost_center_id` |
| `tbl_combined_equipments` | 组合设备（多个设备的组合） | `id`, `name`, `is_input_counted`, `is_output_counted` |
| `tbl_meters` | 计量表信息 | `id`, `name`, `uuid`, `energy_category_id`, `is_counted` |
| `tbl_offline_meters` | 离线计量表（手动录入） | `id`, `name`, `energy_category_id` |
| `tbl_virtual_meters` | 虚拟计量表（计算得出） | `id`, `name`, `expression` (JSON格式) |
| `tbl_points` | 数据点信息 | `id`, `name`, `data_source_id`, `object_type`, `object_id` |

#### 1.3 空间组织表

| 表名 | 说明 | 关键字段 |
|------|------|----------|
| `tbl_spaces` | 空间信息（房间、楼层等） | `id`, `name`, `uuid`, `parent_space_id`, `area` |
| `tbl_stores` | 门店信息 | `id`, `name`, `uuid`, `space_id` |
| `tbl_tenants` | 租户信息 | `id`, `name`, `uuid`, `space_id` |
| `tbl_shopfloors` | 车间信息 | `id`, `name`, `uuid`, `space_id` |

#### 1.4 关联关系表

系统使用大量的关联表来建立多对多关系：

- `tbl_equipments_meters`: 设备与计量表的关联
- `tbl_equipments_offline_meters`: 设备与离线计量表的关联
- `tbl_equipments_virtual_meters`: 设备与虚拟计量表的关联
- `tbl_spaces_equipments`: 空间与设备的关联
- `tbl_spaces_meters`: 空间与计量表的关联
- `tbl_combined_equipments_equipments`: 组合设备与设备的关联
- 等等...

#### 1.5 新能源设备表

| 表名 | 说明 | 关键字段 |
|------|------|----------|
| `tbl_photovoltaic_power_stations` | 光伏电站 | `id`, `name`, `capacity`, `contact_id` |
| `tbl_energy_storage_containers` | 储能容器 | `id`, `name`, `rated_capacity`, `rated_power` |
| `tbl_energy_storage_power_stations` | 储能电站 | `id`, `name`, `rated_capacity` |
| `tbl_microgrids` | 微电网 | `id`, `name`, `address` |
| `tbl_charging_stations` | 充电站 | `id`, `name`, `rated_capacity`, `rated_power` |

#### 1.6 控制与调度表

| 表名 | 说明 | 关键字段 |
|------|------|----------|
| `tbl_commands` | 控制命令 | `id`, `name`, `topic`, `payload` (JSON格式) |
| `tbl_control_modes` | 控制模式 | `id`, `name`, `is_active` |
| `tbl_control_modes_times` | 控制模式时间段 | `id`, `control_mode_id`, `start_time_of_day`, `end_time_of_day` |

#### 1.7 其他配置表

- `tbl_contacts`: 联系人信息
- `tbl_distribution_systems`: 配电系统
- `tbl_distribution_circuits`: 配电回路
- `tbl_energy_flow_diagrams`: 能源流向图
- `tbl_tariffs`: 电价配置
- `tbl_working_calendars`: 工作日历
- `tbl_web_messages`: Web 消息

**开发注意事项**:
- 所有表都有 `id` (BIGINT AUTO_INCREMENT) 作为主键
- 大部分表都有 `uuid` (CHAR(36)) 字段，用于外部系统集成
- 关联表通常只有 `id` 和两个外键字段
- JSON 字段使用 `LONGTEXT` 类型，存储格式化的 JSON 字符串

---

### 2. myems_historical_db (历史数据数据库)

**用途**: 存储实时监测数据和历史数据，是系统数据量最大的数据库之一。

**特点**:
- 数据量巨大，采用时间序列存储
- 包含原始数据和最新值缓存表
- 支持数据质量标记（`is_bad`, `is_published`）

**主要表结构**:

| 表名 | 说明 | 关键字段 | 索引策略 |
|------|------|----------|----------|
| `tbl_analog_value` | 模拟量历史数据 | `point_id`, `utc_date_time`, `actual_value`, `is_bad`, `is_published` | `(point_id, utc_date_time)`, `(utc_date_time)` |
| `tbl_analog_value_latest` | 模拟量最新值（缓存） | `point_id`, `utc_date_time`, `actual_value` | `(point_id, utc_date_time)` |
| `tbl_digital_value` | 数字量历史数据 | `point_id`, `utc_date_time`, `actual_value` (INT) | `(point_id, utc_date_time)`, `(utc_date_time)` |
| `tbl_digital_value_latest` | 数字量最新值（缓存） | `point_id`, `utc_date_time`, `actual_value` | `(point_id, utc_date_time)` |
| `tbl_energy_value` | 能耗历史数据 | `point_id`, `utc_date_time`, `actual_value`, `is_bad`, `is_published` | `(point_id, utc_date_time)`, `(utc_date_time)` |
| `tbl_energy_value_latest` | 能耗最新值（缓存） | `point_id`, `utc_date_time`, `actual_value` | `(point_id, utc_date_time)` |
| `tbl_text_value` | 文本量历史数据 | `point_id`, `utc_date_time`, `actual_value` (LONGTEXT) | `(point_id, utc_date_time)`, `(utc_date_time)` |
| `tbl_text_value_latest` | 文本量最新值（缓存） | `point_id`, `utc_date_time`, `actual_value` | `(point_id, utc_date_time)` |

**文件存储表**:

| 表名 | 说明 | 关键字段 |
|------|------|----------|
| `tbl_cost_files` | 成本文件（Excel/CSV） | `file_name`, `uuid`, `upload_datetime_utc`, `status`, `file_object` (LONGBLOB) |
| `tbl_offline_meter_files` | 离线计量表数据文件 | `file_name`, `uuid`, `upload_datetime_utc`, `status`, `file_object` |
| `tbl_data_repair_files` | 数据修复文件 | `file_name`, `uuid`, `upload_datetime_utc`, `status`, `file_object` |
| `tbl_energy_plan_files` | 能耗计划文件 | `file_name`, `uuid`, `upload_datetime_utc`, `status`, `file_object` |

**数据类型说明**:
- `actual_value`: DECIMAL(21, 6) - 支持高精度数值，6位小数
- `utc_date_time`: DATETIME - UTC 时间，所有时间统一使用 UTC
- `is_bad`: BOOL - 数据质量标记，True 表示坏数据
- `is_published`: BOOL - 发布标记，True 表示已发布

**开发注意事项**:
- 所有时间字段使用 UTC 时间，前端显示时转换为本地时间
- `_latest` 表用于快速查询最新值，避免扫描历史表
- 文件表使用 `LONGBLOB` 存储二进制文件，注意大小限制
- 定期清理历史数据，避免表过大影响性能

---

### 3. myems_energy_db (能耗数据库)

**用途**: 存储各种设备的能耗统计数据，按小时、日、月、年进行聚合。

**特点**:
- 数据由 `myems-aggregation` 服务计算生成
- 按时间粒度分为 hourly, daily, monthly, yearly 表
- 支持按能源分类（category）和能耗分项（item）统计

**表命名规则**:
- `tbl_{对象类型}_{方向}_{分类}_{时间粒度}`
- 对象类型: `meter`, `equipment`, `combined_equipment`, `space`, `store`, `tenant`, `shopfloor`
- 方向: `input` (输入), `output` (输出)
- 分类: `category` (能源分类), `item` (能耗分项)
- 时间粒度: `hourly`, `daily`, `monthly`, `yearly`

**主要表结构**:

#### 3.1 计量表能耗表

| 表名 | 说明 | 关键字段 |
|------|------|----------|
| `tbl_meter_hourly` | 计量表小时能耗 | `meter_id`, `start_datetime_utc`, `actual_value` |
| `tbl_meter_daily` | 计量表日能耗 | `meter_id`, `start_datetime_utc`, `actual_value` |
| `tbl_meter_monthly` | 计量表月能耗 | `meter_id`, `start_datetime_utc`, `actual_value` |
| `tbl_meter_yearly` | 计量表年能耗 | `meter_id`, `start_datetime_utc`, `actual_value` |
| `tbl_offline_meter_hourly` | 离线计量表小时能耗 | `offline_meter_id`, `start_datetime_utc`, `actual_value` |
| `tbl_virtual_meter_hourly` | 虚拟计量表小时能耗 | `virtual_meter_id`, `start_datetime_utc`, `actual_value` |

#### 3.2 设备能耗表

| 表名 | 说明 | 关键字段 |
|------|------|----------|
| `tbl_equipment_input_category_hourly` | 设备输入能耗（按分类） | `equipment_id`, `energy_category_id`, `start_datetime_utc`, `actual_value` |
| `tbl_equipment_input_item_hourly` | 设备输入能耗（按分项） | `equipment_id`, `energy_item_id`, `start_datetime_utc`, `actual_value` |
| `tbl_equipment_output_category_hourly` | 设备输出能耗（按分类） | `equipment_id`, `energy_category_id`, `start_datetime_utc`, `actual_value` |
| `tbl_combined_equipment_input_category_hourly` | 组合设备输入能耗（按分类） | `combined_equipment_id`, `energy_category_id`, `start_datetime_utc`, `actual_value` |
| `tbl_combined_equipment_output_category_hourly` | 组合设备输出能耗（按分类） | `combined_equipment_id`, `energy_category_id`, `start_datetime_utc`, `actual_value` |

#### 3.3 空间能耗表

| 表名 | 说明 | 关键字段 |
|------|------|----------|
| `tbl_space_input_category_hourly` | 空间输入能耗（按分类） | `space_id`, `energy_category_id`, `start_datetime_utc`, `actual_value` |
| `tbl_space_input_item_hourly` | 空间输入能耗（按分项） | `space_id`, `energy_item_id`, `start_datetime_utc`, `actual_value` |
| `tbl_space_output_category_hourly` | 空间输出能耗（按分类） | `space_id`, `energy_category_id`, `start_datetime_utc`, `actual_value` |
| `tbl_store_input_category_hourly` | 门店输入能耗 | `store_id`, `energy_category_id`, `start_datetime_utc`, `actual_value` |
| `tbl_tenant_input_category_hourly` | 租户输入能耗 | `tenant_id`, `energy_category_id`, `start_datetime_utc`, `actual_value` |
| `tbl_shopfloor_input_category_hourly` | 车间输入能耗 | `shopfloor_id`, `energy_category_id`, `start_datetime_utc`, `actual_value` |

#### 3.4 新能源设备能耗表

| 表名 | 说明 | 关键字段 |
|------|------|----------|
| `tbl_photovoltaic_power_station_hourly` | 光伏电站小时发电量 | `photovoltaic_power_station_id`, `start_datetime_utc`, `actual_value` |
| `tbl_energy_storage_container_charge_hourly` | 储能容器充电量 | `energy_storage_container_id`, `start_datetime_utc`, `actual_value` |
| `tbl_energy_storage_container_discharge_hourly` | 储能容器放电量 | `energy_storage_container_id`, `start_datetime_utc`, `actual_value` |
| `tbl_energy_storage_container_grid_buy_hourly` | 储能容器购电量 | `energy_storage_container_id`, `start_datetime_utc`, `actual_value` |
| `tbl_energy_storage_container_grid_sell_hourly` | 储能容器售电量 | `energy_storage_container_id`, `start_datetime_utc`, `actual_value` |
| `tbl_microgrid_charge_hourly` | 微电网充电量 | `microgrid_id`, `start_datetime_utc`, `actual_value` |
| `tbl_microgrid_discharge_hourly` | 微电网放电量 | `microgrid_id`, `start_datetime_utc`, `actual_value` |

**索引设计**:
- 所有表都有复合索引: `(对象_id, 分类_id, start_datetime_utc)` 或 `(对象_id, start_datetime_utc)`
- 支持按对象和时间范围快速查询

**开发注意事项**:
- `start_datetime_utc` 表示时间段的开始时间（如 2024-01-01 00:00:00 表示 1 月 1 日 0 点到 1 点）
- `actual_value` 是聚合后的值，不是原始值
- 数据由 aggregation 服务定期计算，不是实时写入
- 查询时注意时区转换

---

### 4. myems_billing_db (计费数据库)

**用途**: 存储计费相关的能耗数据，结构与 `myems_energy_db` 类似，但数据经过电价计算。

**特点**:
- 表结构与 `myems_energy_db` 完全一致
- 数据由 `myems-aggregation` 服务根据电价配置计算
- 支持分时电价、阶梯电价等复杂计费规则

**主要表**:
- 与 `myems_energy_db` 相同的表结构
- 数据值已乘以对应电价，单位通常是货币单位（如元、美元）

**开发注意事项**:
- 计费数据依赖于 `myems_system_db.tbl_tariffs` 电价配置
- 需要与成本中心（`cost_center`）关联
- 支持多电价策略（分时、阶梯、容量等）

---

### 5. myems_carbon_db (碳排放数据库)

**用途**: 存储碳排放相关的能耗数据，用于碳足迹计算。

**特点**:
- 表结构与 `myems_energy_db` 完全一致
- 数据由 `myems-aggregation` 服务根据碳排放因子计算
- 碳排放因子存储在 `myems_system_db.tbl_energy_categories.kgco2e`

**主要表**:
- 与 `myems_energy_db` 相同的表结构
- 数据值已乘以碳排放因子，单位通常是 kgCO2e（千克二氧化碳当量）

**开发注意事项**:
- 碳排放因子可能随时间变化，需要支持历史因子
- 不同能源类型的碳排放因子不同（电、气、油等）
- 支持范围 1、范围 2、范围 3 的碳排放计算

---

### 6. myems_energy_baseline_db (能耗基线数据库)

**用途**: 存储能耗基线数据，用于节能分析和能效评估。

**特点**:
- 表结构与 `myems_energy_db` 类似
- 基线数据通常基于历史数据或标准值计算
- 用于对比实际能耗与基线能耗，计算节能效果

**主要表**:
- 与 `myems_energy_db` 相同的表结构
- 存储基线值而非实际值

**开发注意事项**:
- 基线数据需要定期更新
- 支持多种基线计算方法（历史平均、回归分析、标准值等）

---

### 7. myems_energy_model_db (能耗模型数据库)

**用途**: 存储 8760 小时年度能耗模型数据（一年 8760 小时）。

**特点**:
- 每个对象存储 8760 条记录（一年的小时数据）
- 用于能耗预测和规划
- 表名包含 `_8760` 后缀

**主要表**:

| 表名 | 说明 | 关键字段 |
|------|------|----------|
| `tbl_meter_8760` | 计量表 8760 小时模型 | `meter_id`, `start_datetime_utc`, `actual_value` |
| `tbl_equipment_input_category_8760` | 设备输入能耗模型 | `equipment_id`, `energy_category_id`, `start_datetime_utc`, `actual_value` |
| `tbl_combined_equipment_input_category_8760` | 组合设备输入能耗模型 | `combined_equipment_id`, `energy_category_id`, `start_datetime_utc`, `actual_value` |
| `tbl_space_input_category_8760` | 空间输入能耗模型 | `space_id`, `energy_category_id`, `start_datetime_utc`, `actual_value` |
| `tbl_shopfloor_input_category_8760` | 车间输入能耗模型 | `shopfloor_id`, `energy_category_id`, `start_datetime_utc`, `actual_value` |
| `tbl_store_input_category_8760` | 门店输入能耗模型 | `store_id`, `energy_category_id`, `start_datetime_utc`, `actual_value` |
| `tbl_tenant_input_category_8760` | 租户输入能耗模型 | `tenant_id`, `energy_category_id`, `start_datetime_utc`, `actual_value` |

**开发注意事项**:
- 8760 小时模型通常基于历史数据或标准模型生成
- 用于年度能耗预测和预算编制
- 支持按周、月、季度等维度查看

---

### 8. myems_energy_plan_db (能耗计划数据库)

**用途**: 存储能耗计划和目标数据。

**特点**:
- 表结构与 `myems_energy_db` 类似
- 存储计划值而非实际值
- 用于能耗预算和目标管理

**主要表**:
- 与 `myems_energy_db` 相同的表结构
- 数据来自计划文件或手动录入

**开发注意事项**:
- 计划数据需要与实际数据对比分析
- 支持多级计划（年度、月度、周度等）

---

### 9. myems_energy_prediction_db (能耗预测数据库)

**用途**: 存储能耗预测数据。

**特点**:
- 表结构与 `myems_energy_db` 类似
- 存储预测值而非实际值
- 用于能耗预测和预警

**主要表**:
- 与 `myems_energy_db` 相同的表结构
- 数据由预测算法生成

**开发注意事项**:
- 预测数据需要定期更新
- 支持多种预测算法（时间序列、机器学习等）
- 预测精度需要持续优化

---

### 10. myems_fdd_db (故障诊断数据库)

**用途**: 存储故障检测和诊断相关数据。

**特点**:
- 支持多种告警渠道（Web、Email、SMS、微信、电话）
- 规则引擎支持复杂的故障检测逻辑
- 支持故障消息的确认和处理

**主要表结构**:

| 表名 | 说明 | 关键字段 |
|------|------|----------|
| `tbl_rules` | 诊断规则 | `id`, `name`, `category`, `fdd_code`, `priority`, `channel`, `expression` (JSON), `message_template`, `is_enabled` |
| `tbl_web_messages` | Web 消息 | `id`, `rule_id`, `user_id`, `subject`, `category`, `priority`, `message`, `status`, `belong_to_object_type`, `belong_to_object_id` |
| `tbl_email_messages` | 邮件消息 | `id`, `rule_id`, `recipient_name`, `recipient_email`, `subject`, `message`, `attachment_file_name`, `status` |
| `tbl_text_messages_outbox` | 短信发件箱 | `id`, `rule_id`, `recipient_mobile`, `message`, `status`, `acknowledge_code` |
| `tbl_text_messages_inbox` | 短信收件箱 | `id`, `sender_mobile`, `message`, `status` |
| `tbl_wechat_messages_outbox` | 微信消息发件箱 | `id`, `rule_id`, `recipient_openid`, `message_template_id`, `message_data` (JSON) |
| `tbl_wechat_messages_inbox` | 微信消息收件箱 | `id`, `sender_openid`, `message`, `status` |
| `tbl_email_servers` | 邮件服务器配置 | `id`, `host`, `port`, `requires_authentication`, `user_name`, `password`, `from_addr` |
| `tbl_wechat_configs` | 微信配置 | `id`, `api_server`, `app_id`, `app_secret`, `access_token`, `expires_datetime_utc` |

**规则分类 (category)**:
- `REALTIME`: 实时告警
- `SYSTEM`: 系统告警
- `SPACE`: 空间告警
- `METER`: 计量表告警
- `TENANT`: 租户告警
- `STORE`: 门店告警
- `SHOPFLOOR`: 车间告警
- `EQUIPMENT`: 设备告警
- `COMBINEDEQUIPMENT`: 组合设备告警

**优先级 (priority)**:
- `CRITICAL`: 严重
- `HIGH`: 高
- `MEDIUM`: 中
- `LOW`: 低

**开发注意事项**:
- `expression` 字段存储 JSON 格式的规则表达式
- `message_template` 支持变量替换（如 `$name`, `$value`）
- 规则支持定时执行和立即执行
- 消息状态: `new` → `sent` → `acknowledged` / `timeout`

---

### 11. myems_user_db (用户数据库)

**用途**: 存储用户认证、API 密钥、邮件消息等。

**特点**:
- 数据量小，但安全性要求高
- 支持用户权限管理
- 支持 API 密钥认证

**主要表结构**:

| 表名 | 说明 | 关键字段 |
|------|------|----------|
| `tbl_users` | 用户信息 | `id`, `name`, `uuid`, `display_name`, `email`, `salt`, `password`, `is_admin`, `is_read_only`, `privilege_id`, `account_expiration_datetime_utc`, `password_expiration_datetime_utc`, `failed_login_count` |
| `tbl_privileges` | 权限配置 | `id`, `name`, `data` (JSON格式) |
| `tbl_sessions` | 用户会话 | `id`, `user_uuid`, `token`, `utc_expires` |
| `tbl_api_keys` | API 密钥 | `id`, `name`, `token`, `created_datetime_utc`, `expires_datetime_utc` |
| `tbl_email_messages` | 邮件消息 | `id`, `recipient_name`, `recipient_email`, `subject`, `message`, `attachment_file_name`, `status`, `scheduled_datetime_utc` |
| `tbl_email_message_sessions` | 邮件会话 | `id`, `recipient_email`, `token`, `expires_datetime_utc` |
| `tbl_logs` | 操作日志 | `id`, `user_uuid`, `request_datetime_utc`, `request_method`, `resource_type`, `resource_id`, `request_body` (JSON) |
| `tbl_notifications` | 通知消息 | `id`, `user_id`, `created_datetime_utc`, `status`, `subject`, `message`, `url` |
| `tbl_new_users` | 新用户（待激活） | `id`, `name`, `uuid`, `display_name`, `email`, `salt`, `password` |
| `tbl_verification_codes` | 验证码 | `id`, `recipient_email`, `verification_code`, `created_datetime_utc`, `expires_datetime_utc` |

**安全设计**:
- 密码使用 salt + hash 存储，不存储明文
- 支持账户和密码过期时间
- 支持登录失败次数限制
- API 密钥支持过期时间

**开发注意事项**:
- 密码字段使用加密存储，不要直接查询
- 会话 token 需要定期清理过期记录
- 操作日志记录所有关键操作，便于审计
- 通知状态: `unread` → `read` → `archived`

---

### 12. myems_reporting_db (报告数据库)

**用途**: 存储报告相关的邮件消息和附件。

**特点**:
- 数据量小
- 支持报告模板和生成的文件存储

**主要表结构**:

| 表名 | 说明 | 关键字段 |
|------|------|----------|
| `tbl_reports` | 报告配置 | `id`, `name`, `uuid`, `expression` (JSON), `is_enabled`, `last_run_datetime_utc`, `next_run_datetime_utc`, `is_run_immediately` |
| `tbl_reports_files` | 报告文件 | `id`, `uuid`, `create_datetime_utc`, `file_name`, `file_type` (xlsx/pdf/docx), `file_object` (LONGBLOB) |
| `tbl_template_files` | 报告模板文件 | `id`, `uuid`, `report_id`, `file_name`, `file_type`, `file_object` |
| `tbl_email_messages` | 邮件消息 | `id`, `recipient_name`, `recipient_email`, `subject`, `message`, `attachment_file_name`, `attachment_file_object`, `status` |

**开发注意事项**:
- 报告文件支持 Excel、PDF、Word 格式
- 模板文件用于生成报告
- 报告支持定时生成和立即生成
- 文件使用 `LONGBLOB` 存储，注意大小限制

---

### 13. myems_production_db (生产数据库)

**用途**: 存储生产相关的产品数据。

**特点**:
- 数据量小
- 用于生产能耗关联分析

**主要表结构**:

| 表名 | 说明 | 关键字段 |
|------|------|----------|
| `tbl_products` | 产品信息 | `id`, `name`, `uuid`, `unit_of_measure`, `tag`, `standard_product_coefficient` |
| `tbl_teams` | 班组信息 | `id`, `name`, `uuid`, `description` |
| `tbl_shifts` | 班次信息 | `id`, `shopfloor_id`, `team_id`, `product_id`, `product_count`, `start_datetime_utc`, `end_datetime_utc`, `reference_timestamp` |
| `tbl_shopfloor_hourly` | 车间小时产量 | `id`, `shopfloor_id`, `start_datetime_utc`, `product_id`, `product_count` |
| `tbl_space_hourly` | 空间小时产量 | `id`, `space_id`, `start_datetime_utc`, `product_id`, `product_count` |
| `tbl_shopfloors_products` | 车间与产品关联 | `id`, `shopfloor_id`, `product_id` |
| `tbl_shopfloors_teams` | 车间与班组关联 | `id`, `shopfloor_id`, `team_id` |

**开发注意事项**:
- 生产数据用于计算单位产品能耗
- 支持按产品、班组、车间等维度统计
- 与能耗数据关联，计算能效指标

---

## 数据流转关系

### 数据采集流程

```
设备/传感器
    ↓ (Modbus TCP/MQTT/HTTP)
myems-modbus-tcp (数据采集服务)
    ↓ (写入)
myems_historical_db.tbl_analog_value / tbl_digital_value / tbl_energy_value
    ↓ (数据规范化)
myems-normalization (数据规范化服务)
    ↓ (数据清洗)
myems-cleaning (数据清洗服务)
    ↓ (数据聚合)
myems-aggregation (数据汇总服务)
    ↓ (写入)
myems_energy_db (能耗数据)
myems_billing_db (计费数据)
myems_carbon_db (碳排放数据)
```

### 数据查询流程

```
用户请求
    ↓
myems-api (API 服务)
    ↓ (查询)
myems_system_db (配置数据)
myems_historical_db (历史数据)
myems_energy_db (能耗数据)
    ↓ (返回)
myems-web / myems-admin (前端展示)
```

### 数据关联关系

```
myems_system_db.tbl_points
    ↓ (point_id)
myems_historical_db.tbl_analog_value
    ↓ (聚合计算)
myems_energy_db.tbl_meter_hourly
    ↓ (关联)
myems_system_db.tbl_meters
    ↓ (关联)
myems_system_db.tbl_equipments
    ↓ (关联)
myems_system_db.tbl_spaces
```

---

## 表结构设计规范

### 通用字段

所有表都包含以下通用字段：

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `id` | BIGINT NOT NULL AUTO_INCREMENT | 主键，自增 |
| `name` | VARCHAR(255) | 名称 |
| `uuid` | CHAR(36) | UUID，用于外部系统集成 |
| `description` | VARCHAR(255) | 描述（可选） |

### 时间字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `utc_date_time` | DATETIME | UTC 时间（历史数据表） |
| `start_datetime_utc` | DATETIME | 时间段开始时间（聚合数据表） |
| `created_datetime_utc` | DATETIME | 创建时间 |
| `updated_datetime_utc` | DATETIME | 更新时间 |
| `last_run_datetime_utc` | DATETIME | 最后运行时间 |
| `next_run_datetime_utc` | DATETIME | 下次运行时间 |

**注意**: 所有时间字段统一使用 UTC 时间，前端显示时转换为本地时间。

### 数值字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `actual_value` | DECIMAL(21, 6) | 实际值，支持高精度（6位小数） |
| `set_value` | DECIMAL(21, 6) | 设定值 |
| `rated_capacity` | DECIMAL(21, 6) | 额定容量 |
| `rated_power` | DECIMAL(21, 6) | 额定功率 |

### JSON 字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `connection` | LONGTEXT | 连接配置（JSON 格式） |
| `expression` | LONGTEXT | 表达式（JSON 格式） |
| `payload` | LONGTEXT | 负载（JSON 格式） |
| `data` | LONGTEXT | 数据（JSON 格式） |

**注意**: JSON 字段存储格式化的 JSON 字符串，需要解析后使用。

### 状态字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `is_enabled` | BOOL | 是否启用 |
| `is_active` | BOOL | 是否激活 |
| `is_bad` | BOOL | 是否坏数据 |
| `is_published` | BOOL | 是否已发布 |
| `is_counted` | BOOL | 是否计入统计 |
| `status` | VARCHAR(32) | 状态（如: new, sent, done, error） |

### 索引设计

**主键索引**:
- 所有表都有 `PRIMARY KEY (id)`

**唯一索引**:
- 关键字段（如 `name`, `uuid`）通常有唯一索引

**复合索引**:
- 查询频繁的字段组合建立复合索引
- 如: `(point_id, utc_date_time)`, `(meter_id, start_datetime_utc)`

**时间索引**:
- 时间字段通常单独建立索引，支持时间范围查询

---

## 开发注意事项

### 1. 时间处理

- **所有时间使用 UTC**: 数据库存储和 API 返回都使用 UTC 时间
- **前端转换**: 前端负责转换为本地时间显示
- **时间格式**: 使用 `DATETIME` 类型，格式: `YYYY-MM-DD HH:MM:SS`
- **时区问题**: 注意夏令时和时区转换

### 2. 数据类型选择

- **数值**: 使用 `DECIMAL(21, 6)` 保证精度，避免浮点数误差
- **文本**: 短文本用 `VARCHAR`，长文本用 `TEXT` 或 `LONGTEXT`
- **JSON**: 使用 `LONGTEXT` 存储 JSON 字符串
- **二进制**: 使用 `LONGBLOB` 存储文件

### 3. 查询优化

- **使用索引**: 查询条件尽量使用索引字段
- **避免全表扫描**: 大数据量表避免 `SELECT *`
- **分页查询**: 列表查询必须分页，避免一次返回大量数据
- **时间范围**: 历史数据查询必须限制时间范围

### 4. 事务处理

- **配置数据**: 系统配置表使用事务保证一致性
- **历史数据**: 历史数据表通常不使用事务，提高写入性能
- **批量操作**: 批量插入使用事务，失败时回滚

### 5. 数据一致性

- **外键约束**: 系统配置表使用外键保证数据一致性
- **关联查询**: 使用 JOIN 查询关联数据，避免多次查询
- **数据校验**: 写入前校验数据格式和范围

### 6. 性能优化

- **读写分离**: 历史数据表支持读写分离
- **分区表**: 大数据量表可以考虑按时间分区
- **缓存策略**: 配置数据和最新值使用缓存
- **批量操作**: 批量插入使用 `INSERT ... VALUES (...), (...), (...)`

### 7. 安全考虑

- **SQL 注入**: 使用参数化查询，避免 SQL 注入
- **密码加密**: 用户密码使用 salt + hash，不存储明文
- **权限控制**: API 接口需要权限验证
- **数据脱敏**: 敏感数据（如密码、密钥）不记录日志

### 8. 错误处理

- **异常捕获**: 数据库操作需要捕获异常
- **错误日志**: 记录详细的错误信息，便于排查
- **重试机制**: 网络错误支持重试
- **降级策略**: 服务不可用时提供降级方案

---

## 安装与升级

### 安装顺序

建议按以下顺序安装数据库：

1. **myems_system_db** - 系统配置数据库（必须先安装）
2. **myems_user_db** - 用户数据库
3. **myems_historical_db** - 历史数据数据库
4. **myems_energy_db** - 能耗数据库
5. **myems_billing_db** - 计费数据库
6. **myems_carbon_db** - 碳排放数据库
7. **myems_energy_baseline_db** - 能耗基线数据库
8. **myems_energy_model_db** - 能耗模型数据库
9. **myems_energy_plan_db** - 能耗计划数据库
10. **myems_energy_prediction_db** - 能耗预测数据库
11. **myems_fdd_db** - 故障诊断数据库
12. **myems_reporting_db** - 报告数据库
13. **myems_production_db** - 生产数据库

### 安装命令

```bash
# 进入数据库安装目录
cd database/install

# 按顺序执行 SQL 脚本
mysql -u root -p < myems_system_db.sql
mysql -u root -p < myems_user_db.sql
mysql -u root -p < myems_historical_db.sql
mysql -u root -p < myems_energy_db.sql
mysql -u root -p < myems_billing_db.sql
mysql -u root -p < myems_carbon_db.sql
mysql -u root -p < myems_energy_baseline_db.sql
mysql -u root -p < myems_energy_model_db.sql
mysql -u root -p < myems_energy_plan_db.sql
mysql -u root -p < myems_energy_prediction_db.sql
mysql -u root -p < myems_fdd_db.sql
mysql -u root -p < myems_reporting_db.sql
mysql -u root -p < myems_production_db.sql
```

### 数据库升级

数据库升级脚本位于 `database/upgrade/` 目录，按版本号命名（如 `upgrade5.10.0.sql`）。

升级前请：
1. **备份数据库**: 升级前必须备份所有数据库
2. **查看升级说明**: 阅读升级脚本中的注释
3. **测试环境验证**: 先在测试环境验证升级脚本
4. **按版本顺序升级**: 按版本号顺序执行升级脚本

### 数据库维护

- **定期备份**: 建议每天备份一次，保留至少 30 天
- **清理历史数据**: 定期清理过期的历史数据，避免表过大
- **优化表**: 定期执行 `OPTIMIZE TABLE` 优化表结构
- **监控性能**: 监控数据库性能，及时发现问题

---

## 相关文档

- [MyEMS 官方文档](https://myems.io/docs/installation/database)
- [MyEMS API 文档](./../myems-api/README.md)
- [MyEMS 数据采集文档](./../myems-modbus-tcp/README.md)
- [MyEMS 数据汇总文档](./../myems-aggregation/README.md)
