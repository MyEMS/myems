# MyEMS Database

MyEMS (My Energy Management System) 使用多个数据库来存储不同类型的数据。本文档描述了所有数据库的结构和用途。

## 数据库概览

MyEMS 系统包含以下 13 个数据库：

| 数据库名称 | 用途 | 主要功能 |
|-----------|------|----------|
| `myems_system_db` | 系统数据库 | 存储系统配置、设备信息、用户权限等基础数据 |
| `myems_historical_db` | 历史数据数据库 | 存储实时监测数据、历史数据、成本文件等 |
| `myems_energy_db` | 能耗数据库 | 存储各种设备的能耗数据（按小时、日、月、年统计） |
| `myems_billing_db` | 计费数据库 | 存储计费相关的能耗数据 |
| `myems_carbon_db` | 碳排放数据库 | 存储碳排放相关的能耗数据 |
| `myems_energy_baseline_db` | 能耗基线数据库 | 存储能耗基线数据，用于节能分析 |
| `myems_energy_model_db` | 能耗模型数据库 | 存储8760小时年度能耗模型数据 |
| `myems_energy_plan_db` | 能耗计划数据库 | 存储能耗计划和目标数据 |
| `myems_energy_prediction_db` | 能耗预测数据库 | 存储能耗预测数据 |
| `myems_fdd_db` | 故障诊断数据库 | 存储故障检测和诊断相关数据 |
| `myems_user_db` | 用户数据库 | 存储用户认证、API密钥、邮件消息等 |
| `myems_reporting_db` | 报告数据库 | 存储报告相关的邮件消息和附件 |
| `myems_production_db` | 生产数据库 | 存储生产相关的产品数据 |

## 数据库详细说明

### 1. myems_system_db (系统数据库)
**用途**: 存储系统的基础配置和元数据
**主要表结构**:
- `tbl_charging_stations` - 充电站信息
- `tbl_combined_equipments` - 组合设备信息
- `tbl_contacts` - 联系人信息
- `tbl_cost_centers` - 成本中心
- `tbl_data_sources` - 数据源配置
- `tbl_energy_categories` - 能源分类
- `tbl_energy_items` - 能耗分项
- `tbl_equipments` - 设备信息
- `tbl_meters` - 计量表信息
- `tbl_offline_meters` - 离线计量表
- `tbl_points` - 数据点信息
- `tbl_shopfloors` - 车间信息
- `tbl_spaces` - 空间信息
- `tbl_stores` - 门店信息
- `tbl_tenants` - 租户信息
- `tbl_users` - 用户信息
- `tbl_web_messages` - Web消息

### 2. myems_historical_db (历史数据数据库)
**用途**: 存储实时监测数据和历史数据
**主要表结构**:
- `tbl_analog_value` - 模拟量历史数据
- `tbl_analog_value_latest` - 模拟量最新数据
- `tbl_cost_files` - 成本文件
- `tbl_digital_value` - 数字量历史数据
- `tbl_digital_value_latest` - 数字量最新数据
- `tbl_energy_value` - 能耗历史数据
- `tbl_energy_value_latest` - 能耗最新数据
- `tbl_offline_meter_value` - 离线计量表数据

### 3. myems_energy_db (能耗数据库)
**用途**: 存储各种设备的能耗统计数据
**主要表结构**:
- `tbl_combined_equipment_input_category_hourly` - 组合设备输入能耗（按小时）
- `tbl_combined_equipment_input_item_hourly` - 组合设备输入分项（按小时）
- `tbl_combined_equipment_output_category_hourly` - 组合设备输出能耗（按小时）
- `tbl_combined_equipment_output_item_hourly` - 组合设备输出分项（按小时）
- `tbl_equipment_input_category_hourly` - 设备输入能耗（按小时）
- `tbl_equipment_input_item_hourly` - 设备输入分项（按小时）
- `tbl_equipment_output_category_hourly` - 设备输出能耗（按小时）
- `tbl_equipment_output_item_hourly` - 设备输出分项（按小时）
- `tbl_meter_hourly` - 计量表数据（按小时）
- `tbl_offline_meter_hourly` - 离线计量表数据（按小时）
- `tbl_shopfloor_input_category_hourly` - 车间输入能耗（按小时）
- `tbl_shopfloor_input_item_hourly` - 车间输入分项（按小时）
- `tbl_space_input_category_hourly` - 空间输入能耗（按小时）
- `tbl_space_input_item_hourly` - 空间输入分项（按小时）
- `tbl_store_input_category_hourly` - 门店输入能耗（按小时）
- `tbl_store_input_item_hourly` - 门店输入分项（按小时）
- `tbl_tenant_input_category_hourly` - 租户输入能耗（按小时）
- `tbl_tenant_input_item_hourly` - 租户输入分项（按小时）
- 以及对应的日、月、年统计表

### 4. myems_billing_db (计费数据库)
**用途**: 存储计费相关的能耗数据
**主要表结构**: 与 `myems_energy_db` 类似，但专门用于计费计算

### 5. myems_carbon_db (碳排放数据库)
**用途**: 存储碳排放相关的能耗数据
**主要表结构**: 与 `myems_energy_db` 类似，但专门用于碳排放计算

### 6. myems_energy_baseline_db (能耗基线数据库)
**用途**: 存储能耗基线数据，用于节能分析
**主要表结构**: 与 `myems_energy_db` 类似，但存储基线数据

### 7. myems_energy_model_db (能耗模型数据库)
**用途**: 存储8760小时年度能耗模型数据
**主要表结构**:
- `tbl_combined_equipment_input_category_8760` - 组合设备输入能耗模型（8760小时）
- `tbl_combined_equipment_input_item_8760` - 组合设备输入分项模型（8760小时）
- `tbl_equipment_input_category_8760` - 设备输入能耗模型（8760小时）
- `tbl_equipment_input_item_8760` - 设备输入分项模型（8760小时）
- `tbl_meter_8760` - 计量表模型（8760小时）
- `tbl_shopfloor_input_category_8760` - 车间输入能耗模型（8760小时）
- `tbl_space_input_category_8760` - 空间输入能耗模型（8760小时）
- `tbl_store_input_category_8760` - 门店输入能耗模型（8760小时）
- `tbl_tenant_input_category_8760` - 租户输入能耗模型（8760小时）

### 8. myems_energy_plan_db (能耗计划数据库)
**用途**: 存储能耗计划和目标数据
**主要表结构**: 与 `myems_energy_db` 类似，但存储计划数据

### 9. myems_energy_prediction_db (能耗预测数据库)
**用途**: 存储能耗预测数据
**主要表结构**: 与 `myems_energy_db` 类似，但存储预测数据

### 10. myems_fdd_db (故障诊断数据库)
**用途**: 存储故障检测和诊断相关数据
**主要表结构**:
- `tbl_email_messages` - 邮件消息
- `tbl_rules` - 诊断规则
- `tbl_rule_logs` - 规则执行日志

### 11. myems_user_db (用户数据库)
**用途**: 存储用户认证和API相关数据
**主要表结构**:
- `tbl_api_keys` - API密钥
- `tbl_email_messages` - 邮件消息
- `tbl_sessions` - 用户会话
- `tbl_users` - 用户信息

### 12. myems_reporting_db (报告数据库)
**用途**: 存储报告相关的邮件消息和附件
**主要表结构**:
- `tbl_email_messages` - 邮件消息

### 13. myems_production_db (生产数据库)
**用途**: 存储生产相关的产品数据
**主要表结构**:
- `tbl_products` - 产品信息
- `tbl_production_orders` - 生产订单
- `tbl_production_plans` - 生产计划

## 安装说明

### 安装顺序
建议按以下顺序安装数据库：

1. **myems_system_db** - 首先安装系统数据库，包含基础配置
2. **myems_user_db** - 安装用户数据库，用于用户认证
3. **myems_historical_db** - 安装历史数据数据库
4. **myems_energy_db** - 安装能耗数据库
5. **myems_billing_db** - 安装计费数据库
6. **myems_carbon_db** - 安装碳排放数据库
7. **myems_energy_baseline_db** - 安装能耗基线数据库
8. **myems_energy_model_db** - 安装能耗模型数据库
9. **myems_energy_plan_db** - 安装能耗计划数据库
10. **myems_energy_prediction_db** - 安装能耗预测数据库
11. **myems_fdd_db** - 安装故障诊断数据库
12. **myems_reporting_db** - 安装报告数据库
13. **myems_production_db** - 最后安装生产数据库

### 安装命令
```bash
# 进入数据库安装目录
cd database/install

# 按顺序执行SQL脚本
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

### 数据库配置
所有数据库都使用以下配置：
- 字符集: `utf8mb4`
- 排序规则: `utf8mb4_unicode_ci`
- 存储引擎: InnoDB (默认)

## 相关文档
- [MyEMS 官方文档](https://myems.io/docs/installation/database)
