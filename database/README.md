# MyEMS Database Design Document

> This document is intended for developers. It describes the database architecture, table structures, and design principles of the MyEMS Energy Management System.

## Table of Contents

- [System Overview](#system-overview)
- [Database Architecture](#database-architecture)
- [Database Details](#database-details)
- [Data Flow](#data-flow)
- [Table Design Conventions](#table-design-conventions)
- [Development Notes](#development-notes)
- [Installation and Upgrade](#installation-and-upgrade)

---

## System Overview

MyEMS is an industry-leading open-source energy management system. It references the ISO 50001 Energy Management System standard (GB/T 23331-2020) and is suitable for scenarios such as buildings, factories, shopping malls, hospitals, and campuses to collect, analyze, and report energy and carbon emission data.

### System Modules

MyEMS adopts a microservice architecture and mainly includes the following modules:

- **myems-api**: RESTful API service (Python + Falcon)
- **myems-admin**: Admin UI (AngularJS)
- **myems-web**: User-facing web UI (ReactJS)
- **myems-modbus-tcp**: Modbus TCP data acquisition service
- **myems-normalization**: Data normalization service
- **myems-cleaning**: Data cleaning service
- **myems-aggregation**: Data aggregation service (energy consumption, billing, and carbon emission calculations)

### Database Overview

MyEMS uses a **multi-database separation architecture**, storing different types of data in different databases to improve performance and make maintenance and scaling easier. The system contains **13 databases**:

| Database Name | Purpose | Primary Functions | Data Scale |
|--------------|---------|-------------------|------------|
| `myems_system_db` | System configuration database | Stores foundational data such as system configuration, device information, and user privileges | Small/Medium |
| `myems_historical_db` | Historical data database | Stores real-time monitoring data, historical data, cost files, etc. | **Large** |
| `myems_energy_db` | Energy database | Stores energy consumption statistics for various objects (hour/day/month/year) | **Large** |
| `myems_billing_db` | Billing database | Stores billing-related energy data | **Large** |
| `myems_carbon_db` | Carbon database | Stores carbon-emission-related energy data | **Large** |
| `myems_energy_baseline_db` | Energy baseline database | Stores baseline data for energy-saving analysis | Medium |
| `myems_energy_model_db` | Energy model database | Stores annual energy models with 8760 hourly points | Medium |
| `myems_energy_plan_db` | Energy plan database | Stores energy plans and targets | Medium |
| `myems_energy_prediction_db` | Energy prediction database | Stores energy prediction data | Medium |
| `myems_fdd_db` | Fault detection and diagnosis database | Stores FDD-related data | Medium |
| `myems_user_db` | User database | Stores user authentication, API keys, email messages, etc. | Small |
| `myems_reporting_db` | Reporting database | Stores reporting-related email messages and attachments | Small |
| `myems_production_db` | Production database | Stores production-related product data | Small |

---

## Database Architecture

### Design Principles

1. **Data separation**: Separate data into different databases by type and purpose to avoid an oversized single database
2. **Read/write separation**: Historical data uses time-series-oriented storage for efficient queries
3. **Horizontal scalability**: Large databases (`myems_historical_db`, `myems_energy_db`) can be scaled independently
4. **Unified conventions**: All databases use the same character set and collation

### Database Settings

All databases use the following unified settings:

- **Character set**: `utf8mb4` (supports full UTF-8, including emoji)
- **Collation**: `utf8mb4_unicode_ci` (Unicode collation)
- **Storage engine**: InnoDB (default; supports transactions and foreign keys)

### Naming Conventions

- **Database naming**: `myems_{function}_db` (lowercase, underscore-separated)
- **Table naming**: `tbl_{entity_name}` (lowercase, underscore-separated)
- **Column naming**: lowercase with underscores, e.g. `start_datetime_utc`
- **Index naming**: `tbl_{table_name}_index_{number}`

---

## Database Details

### 1. myems_system_db (System Configuration Database)

**Purpose**: Stores the system’s basic configuration and metadata; it is the core configuration database of the whole system.

**Characteristics**:
- Contains the most tables (about 150+ tables)
- Relatively small data volume but complex structure
- Contains many relationship (junction) tables

**Main table categories**:

#### 1.1 Basic configuration tables

| Table | Description | Key columns |
|------|-------------|-------------|
| `tbl_energy_categories` | Energy categories (electricity, water, gas, cooling, heating, etc.) | `id`, `name`, `unit_of_measure`, `kgce`, `kgco2e` |
| `tbl_energy_items` | Energy items (lighting, HVAC, power, etc.) | `id`, `name`, `energy_category_id` |
| `tbl_cost_centers` | Cost centers | `id`, `name`, `external_id` |
| `tbl_data_sources` | Data source configuration | `id`, `name`, `gateway_id`, `protocol`, `connection` |
| `tbl_protocols` | Protocol configuration | `id`, `name`, `protocol_type` |

#### 1.2 Equipment management tables

| Table | Description | Key columns |
|------|-------------|-------------|
| `tbl_equipments` | Equipment information | `id`, `name`, `uuid`, `equipment_type_id`, `cost_center_id` |
| `tbl_combined_equipments` | Combined equipment (a combination of multiple equipments) | `id`, `name`, `is_input_counted`, `is_output_counted` |
| `tbl_meters` | Meter information | `id`, `name`, `uuid`, `energy_category_id`, `is_counted` |
| `tbl_offline_meters` | Offline meters (manual input) | `id`, `name`, `energy_category_id` |
| `tbl_virtual_meters` | Virtual meters (calculated) | `id`, `name`, `expression` (JSON format) |
| `tbl_points` | Point information | `id`, `name`, `data_source_id`, `object_type`, `object_id` |

#### 1.3 Space organization tables

| Table | Description | Key columns |
|------|-------------|-------------|
| `tbl_spaces` | Space information (rooms, floors, etc.) | `id`, `name`, `uuid`, `parent_space_id`, `area` |
| `tbl_stores` | Store information | `id`, `name`, `uuid`, `space_id` |
| `tbl_tenants` | Tenant information | `id`, `name`, `uuid`, `space_id` |
| `tbl_shopfloors` | Shopfloor information | `id`, `name`, `uuid`, `space_id` |

#### 1.4 Relationship tables

The system uses many junction tables to build many-to-many relationships:

- `tbl_equipments_meters`: Equipment-to-meter mapping
- `tbl_equipments_offline_meters`: Equipment-to-offline-meter mapping
- `tbl_equipments_virtual_meters`: Equipment-to-virtual-meter mapping
- `tbl_spaces_equipments`: Space-to-equipment mapping
- `tbl_spaces_meters`: Space-to-meter mapping
- `tbl_combined_equipments_equipments`: Combined-equipment-to-equipment mapping
- etc.

#### 1.5 New energy equipment tables

| Table | Description | Key columns |
|------|-------------|-------------|
| `tbl_photovoltaic_power_stations` | Photovoltaic power stations | `id`, `name`, `capacity`, `contact_id` |
| `tbl_energy_storage_containers` | Energy storage containers | `id`, `name`, `rated_capacity`, `rated_power` |
| `tbl_energy_storage_power_stations` | Energy storage power stations | `id`, `name`, `rated_capacity` |
| `tbl_microgrids` | Microgrids | `id`, `name`, `address` |
| `tbl_charging_stations` | Charging stations | `id`, `name`, `rated_capacity`, `rated_power` |

#### 1.6 Control and dispatch tables

| Table | Description | Key columns |
|------|-------------|-------------|
| `tbl_commands` | Control commands | `id`, `name`, `topic`, `payload` (JSON format) |
| `tbl_control_modes` | Control modes | `id`, `name`, `is_active` |
| `tbl_control_modes_times` | Control mode time windows | `id`, `control_mode_id`, `start_time_of_day`, `end_time_of_day` |

#### 1.7 Other configuration tables

- `tbl_contacts`: Contact information
- `tbl_distribution_systems`: Distribution systems
- `tbl_distribution_circuits`: Distribution circuits
- `tbl_energy_flow_diagrams`: Energy flow diagrams
- `tbl_tariffs`: Tariff configuration
- `tbl_working_calendars`: Working calendars
- `tbl_web_messages`: Web messages

**Development notes**:
- All tables have `id` (BIGINT AUTO_INCREMENT) as the primary key
- Most tables have a `uuid` (CHAR(36)) column for external system integration
- Junction tables usually contain only `id` plus two foreign key columns
- JSON fields use `LONGTEXT` to store formatted JSON strings

---

### 2. myems_historical_db (Historical Data Database)

**Purpose**: Stores real-time monitoring and historical data. It is one of the largest databases in the system.

**Characteristics**:
- Massive data volume; stored in a time-series-oriented way
- Includes raw history tables and latest-value cache tables
- Supports data quality flags (`is_bad`, `is_published`)

**Main table structures**:

| Table | Description | Key columns | Index strategy |
|------|-------------|------------|----------------|
| `tbl_analog_value` | Analog history data | `point_id`, `utc_date_time`, `actual_value`, `is_bad`, `is_published` | `(point_id, utc_date_time)`, `(utc_date_time)` |
| `tbl_analog_value_latest` | Latest analog value (cache) | `point_id`, `utc_date_time`, `actual_value` | `(point_id, utc_date_time)` |
| `tbl_digital_value` | Digital history data | `point_id`, `utc_date_time`, `actual_value` (INT) | `(point_id, utc_date_time)`, `(utc_date_time)` |
| `tbl_digital_value_latest` | Latest digital value (cache) | `point_id`, `utc_date_time`, `actual_value` | `(point_id, utc_date_time)` |
| `tbl_energy_value` | Energy value history data | `point_id`, `utc_date_time`, `actual_value`, `is_bad`, `is_published` | `(point_id, utc_date_time)`, `(utc_date_time)` |
| `tbl_energy_value_latest` | Latest energy value (cache) | `point_id`, `utc_date_time`, `actual_value` | `(point_id, utc_date_time)` |
| `tbl_text_value` | Text history data | `point_id`, `utc_date_time`, `actual_value` (LONGTEXT) | `(point_id, utc_date_time)`, `(utc_date_time)` |
| `tbl_text_value_latest` | Latest text value (cache) | `point_id`, `utc_date_time`, `actual_value` | `(point_id, utc_date_time)` |

**File storage tables**:

| Table | Description | Key columns |
|------|-------------|------------|
| `tbl_cost_files` | Cost files (Excel/CSV) | `file_name`, `uuid`, `upload_datetime_utc`, `status`, `file_object` (LONGBLOB) |
| `tbl_offline_meter_files` | Offline meter data files | `file_name`, `uuid`, `upload_datetime_utc`, `status`, `file_object` |
| `tbl_data_repair_files` | Data repair files | `file_name`, `uuid`, `upload_datetime_utc`, `status`, `file_object` |
| `tbl_energy_plan_files` | Energy plan files | `file_name`, `uuid`, `upload_datetime_utc`, `status`, `file_object` |

**Data type notes**:
- `actual_value`: DECIMAL(21, 6) - high precision numeric values with 6 decimal places
- `utc_date_time`: DATETIME - UTC time; the entire system standardizes on UTC
- `is_bad`: BOOL - data quality flag; True indicates bad data
- `is_published`: BOOL - publish flag; True indicates published

**Development notes**:
- All time columns use UTC; the frontend converts to local time for display
- `_latest` tables are for fast latest-value queries to avoid scanning history tables
- File tables use `LONGBLOB` for binary file storage; be mindful of size limits
- Clean up historical data periodically to prevent oversized tables from impacting performance

---

### 3. myems_energy_db (Energy Database)

**Purpose**: Stores energy consumption statistics for various objects aggregated by hour, day, month, and year.

**Characteristics**:
- Data is generated by the `myems-normalization` and `myems-aggregation` services
- By granularity, the hourly tables are primary; other granularities (daily, monthly, yearly) can be computed from hourly tables
- Supports statistics by energy category (category) and energy item (item)

**Table naming rules**:
- `tbl_{object_type}_{direction}_{classification}_{time_granularity}`
- Object types: `meter`, `equipment`, `combined_equipment`, `space`, `store`, `tenant`, `shopfloor`
- Directions: `input` (input), `output` (output)
- Classifications: `category` (energy category), `item` (energy item)
- Time granularity: `hourly`

**Main table structures**:

#### 3.1 Meter energy tables

| Table | Description | Key columns |
|------|-------------|-------------|
| `tbl_meter_hourly` | Meter hourly energy | `meter_id`, `start_datetime_utc`, `actual_value` |
| `tbl_offline_meter_hourly` | Offline meter hourly energy | `offline_meter_id`, `start_datetime_utc`, `actual_value` |
| `tbl_virtual_meter_hourly` | Virtual meter hourly energy | `virtual_meter_id`, `start_datetime_utc`, `actual_value` |

#### 3.2 Equipment energy tables

| Table | Description | Key columns |
|------|-------------|-------------|
| `tbl_equipment_input_category_hourly` | Equipment input energy (by category) | `equipment_id`, `energy_category_id`, `start_datetime_utc`, `actual_value` |
| `tbl_equipment_input_item_hourly` | Equipment input energy (by item) | `equipment_id`, `energy_item_id`, `start_datetime_utc`, `actual_value` |
| `tbl_equipment_output_category_hourly` | Equipment output energy (by category) | `equipment_id`, `energy_category_id`, `start_datetime_utc`, `actual_value` |
| `tbl_combined_equipment_input_category_hourly` | Combined equipment input energy (by category) | `combined_equipment_id`, `energy_category_id`, `start_datetime_utc`, `actual_value` |
| `tbl_combined_equipment_output_category_hourly` | Combined equipment output energy (by category) | `combined_equipment_id`, `energy_category_id`, `start_datetime_utc`, `actual_value` |

#### 3.3 Space energy tables

| Table | Description | Key columns |
|------|-------------|-------------|
| `tbl_space_input_category_hourly` | Space input energy (by category) | `space_id`, `energy_category_id`, `start_datetime_utc`, `actual_value` |
| `tbl_space_input_item_hourly` | Space input energy (by item) | `space_id`, `energy_item_id`, `start_datetime_utc`, `actual_value` |
| `tbl_space_output_category_hourly` | Space output energy (by category) | `space_id`, `energy_category_id`, `start_datetime_utc`, `actual_value` |
| `tbl_store_input_category_hourly` | Store input energy | `store_id`, `energy_category_id`, `start_datetime_utc`, `actual_value` |
| `tbl_tenant_input_category_hourly` | Tenant input energy | `tenant_id`, `energy_category_id`, `start_datetime_utc`, `actual_value` |
| `tbl_shopfloor_input_category_hourly` | Shopfloor input energy | `shopfloor_id`, `energy_category_id`, `start_datetime_utc`, `actual_value` |

#### 3.4 New energy equipment tables

| Table | Description | Key columns |
|------|-------------|-------------|
| `tbl_photovoltaic_power_station_hourly` | PV power station hourly generation | `photovoltaic_power_station_id`, `start_datetime_utc`, `actual_value` |
| `tbl_energy_storage_container_charge_hourly` | Energy storage container hourly charge | `energy_storage_container_id`, `start_datetime_utc`, `actual_value` |
| `tbl_energy_storage_container_discharge_hourly` | Energy storage container hourly discharge | `energy_storage_container_id`, `start_datetime_utc`, `actual_value` |
| `tbl_energy_storage_container_grid_buy_hourly` | Energy storage container hourly grid buy | `energy_storage_container_id`, `start_datetime_utc`, `actual_value` |
| `tbl_energy_storage_container_grid_sell_hourly` | Energy storage container hourly grid sell | `energy_storage_container_id`, `start_datetime_utc`, `actual_value` |
| `tbl_microgrid_charge_hourly` | Microgrid hourly charge | `microgrid_id`, `start_datetime_utc`, `actual_value` |
| `tbl_microgrid_discharge_hourly` | Microgrid hourly discharge | `microgrid_id`, `start_datetime_utc`, `actual_value` |

**Index design**:
- All tables have composite indexes: `(object_id, classification_id, start_datetime_utc)` or `(object_id, start_datetime_utc)`
- Supports fast queries by object and time range

**Development notes**:
- `start_datetime_utc` is the start time of the time window (e.g., `2024-01-01 00:00:00` represents 00:00–01:00 on Jan 1)
- `actual_value` is an aggregated value, not a raw value
- Data is computed periodically by the normalization and aggregation services; it is not written in real time
- Be careful with timezone conversion during queries and presentation

---

### 4. myems_billing_db (Billing Database)

**Purpose**: Stores billing-related energy data. Its schema is similar to `myems_energy_db`, but values are calculated using tariffs.

**Characteristics**:
- Table structures are identical to `myems_energy_db`
- Data is computed by `myems-aggregation` according to tariff settings
- Supports complex billing rules such as time-of-use and tiered pricing

**Main tables**:
- Same table structure as `myems_energy_db`
- Values are multiplied by the corresponding tariff; the unit is usually a currency unit (e.g., CNY, USD)

**Development notes**:
- Billing data depends on `myems_system_db.tbl_tariffs` tariff configuration
- Must be associated with the cost center (`cost_center`)
- Supports multiple tariff strategies (time-of-use, tiered, demand/capacity, etc.)

---

### 5. myems_carbon_db (Carbon Database)

**Purpose**: Stores carbon-emission-related energy data for carbon footprint calculation.

**Characteristics**:
- Table structures are identical to `myems_energy_db`
- Data is computed by `myems-aggregation` according to carbon emission factors
- Carbon emission factors are stored in `myems_system_db.tbl_energy_categories.kgco2e`

**Main tables**:
- Same table structure as `myems_energy_db`
- Values are multiplied by the carbon emission factor; the unit is usually kgCO2e (kilograms of CO2 equivalent)

**Development notes**:
- Emission factors may change over time; historical factors may be needed
- Emission factors differ by energy type (electricity, gas, oil, etc.)
- Supports Scope 1, Scope 2, and Scope 3 carbon calculations

---

### 6. myems_energy_baseline_db (Energy Baseline Database)

**Purpose**: Stores baseline data used for energy-saving analysis and efficiency evaluation.

**Characteristics**:
- Schema similar to `myems_energy_db`
- Baseline values are typically derived from historical data or standard values
- Used to compare actual consumption vs baseline consumption to calculate savings

**Main tables**:
- Same table structure as `myems_energy_db`
- Stores baseline values rather than actual values

**Development notes**:
- Baseline data should be updated periodically
- Supports multiple baseline calculation methods (historical average, regression, standard values, etc.)

---

### 7. myems_energy_model_db (Energy Model Database)

**Purpose**: Stores 8760-hour annual energy model data (8760 hours per year).

**Characteristics**:
- Each object stores 8760 records (one year of hourly data)
- Used for energy prediction and planning
- Table names include the `_8760` suffix

**Main tables**:

| Table | Description | Key columns |
|------|-------------|-------------|
| `tbl_meter_8760` | Meter 8760-hour model | `meter_id`, `start_datetime_utc`, `actual_value` |
| `tbl_equipment_input_category_8760` | Equipment input energy model | `equipment_id`, `energy_category_id`, `start_datetime_utc`, `actual_value` |
| `tbl_combined_equipment_input_category_8760` | Combined equipment input energy model | `combined_equipment_id`, `energy_category_id`, `start_datetime_utc`, `actual_value` |
| `tbl_space_input_category_8760` | Space input energy model | `space_id`, `energy_category_id`, `start_datetime_utc`, `actual_value` |
| `tbl_shopfloor_input_category_8760` | Shopfloor input energy model | `shopfloor_id`, `energy_category_id`, `start_datetime_utc`, `actual_value` |
| `tbl_store_input_category_8760` | Store input energy model | `store_id`, `energy_category_id`, `start_datetime_utc`, `actual_value` |
| `tbl_tenant_input_category_8760` | Tenant input energy model | `tenant_id`, `energy_category_id`, `start_datetime_utc`, `actual_value` |

**Development notes**:
- The 8760-hour model is usually generated from historical data or standard models
- Used for annual energy forecasting and budgeting
- Supports views by week, month, quarter, etc.

---

### 8. myems_energy_plan_db (Energy Plan Database)

**Purpose**: Stores energy plans and target data.

**Characteristics**:
- Schema similar to `myems_energy_db`
- Stores planned values rather than actual values
- Used for energy budgeting and target management

**Main tables**:
- Same table structure as `myems_energy_db`
- Data comes from plan files or manual input

**Development notes**:
- Planned data should be compared with actual data for analysis
- Supports multi-level plans (annual, monthly, weekly, etc.)

---

### 9. myems_energy_prediction_db (Energy Prediction Database)

**Purpose**: Stores energy prediction data.

**Characteristics**:
- Schema similar to `myems_energy_db`
- Stores predicted values rather than actual values
- Used for energy prediction and early warning

**Main tables**:
- Same table structure as `myems_energy_db`
- Data is produced by prediction algorithms

**Development notes**:
- Prediction data should be updated periodically
- Supports multiple prediction approaches (time series, machine learning, etc.)
- Prediction accuracy should be continuously improved

---

### 10. myems_fdd_db (Fault Detection and Diagnosis Database)

**Purpose**: Stores fault detection and diagnosis (FDD) related data.

**Characteristics**:
- Supports multiple alert channels (Web, Email, SMS, WeChat, phone call)
- A rule engine supports complex fault detection logic
- Supports acknowledgment and handling of fault messages

**Main table structures**:

| Table | Description | Key columns |
|------|-------------|-------------|
| `tbl_rules` | Diagnosis rules | `id`, `name`, `category`, `fdd_code`, `priority`, `channel`, `expression` (JSON), `message_template`, `is_enabled` |
| `tbl_web_messages` | Web messages | `id`, `rule_id`, `user_id`, `subject`, `category`, `priority`, `message`, `status`, `belong_to_object_type`, `belong_to_object_id` |
| `tbl_email_messages` | Email messages | `id`, `rule_id`, `recipient_name`, `recipient_email`, `subject`, `message`, `attachment_file_name`, `status` |
| `tbl_text_messages_outbox` | SMS outbox | `id`, `rule_id`, `recipient_mobile`, `message`, `status`, `acknowledge_code` |
| `tbl_text_messages_inbox` | SMS inbox | `id`, `sender_mobile`, `message`, `status` |
| `tbl_wechat_messages_outbox` | WeChat outbox | `id`, `rule_id`, `recipient_openid`, `message_template_id`, `message_data` (JSON) |
| `tbl_wechat_messages_inbox` | WeChat inbox | `id`, `sender_openid`, `message`, `status` |
| `tbl_email_servers` | Email server configuration | `id`, `host`, `port`, `requires_authentication`, `user_name`, `password`, `from_addr` |
| `tbl_wechat_configs` | WeChat configuration | `id`, `api_server`, `app_id`, `app_secret`, `access_token`, `expires_datetime_utc` |

**Rule categories (category)**:
- `REALTIME`: Realtime alerts
- `SYSTEM`: System alerts
- `SPACE`: Space alerts
- `METER`: Meter alerts
- `TENANT`: Tenant alerts
- `STORE`: Store alerts
- `SHOPFLOOR`: Shopfloor alerts
- `EQUIPMENT`: Equipment alerts
- `COMBINEDEQUIPMENT`: Combined equipment alerts

**Priorities (priority)**:
- `CRITICAL`: Critical
- `HIGH`: High
- `MEDIUM`: Medium
- `LOW`: Low

**Development notes**:
- The `expression` column stores JSON-formatted rule expressions
- `message_template` supports variable replacement (e.g., `$name`, `$value`)
- Rules support scheduled execution and immediate execution
- Message lifecycle: `new` → `sent` → `acknowledged` / `timeout`

---

### 11. myems_user_db (User Database)

**Purpose**: Stores user authentication, API keys, email messages, etc.

**Characteristics**:
- Small data volume but high security requirements
- Supports user privilege management
- Supports API key authentication

**Main table structures**:

| Table | Description | Key columns |
|------|-------------|-------------|
| `tbl_users` | Users | `id`, `name`, `uuid`, `display_name`, `email`, `salt`, `password`, `is_admin`, `is_read_only`, `privilege_id`, `account_expiration_datetime_utc`, `password_expiration_datetime_utc`, `failed_login_count` |
| `tbl_privileges` | Privileges | `id`, `name`, `data` (JSON format) |
| `tbl_sessions` | Sessions | `id`, `user_uuid`, `token`, `utc_expires` |
| `tbl_api_keys` | API keys | `id`, `name`, `token`, `created_datetime_utc`, `expires_datetime_utc` |
| `tbl_email_messages` | Email messages | `id`, `recipient_name`, `recipient_email`, `subject`, `message`, `attachment_file_name`, `status`, `scheduled_datetime_utc` |
| `tbl_email_message_sessions` | Email sessions | `id`, `recipient_email`, `token`, `expires_datetime_utc` |
| `tbl_logs` | Audit logs | `id`, `user_uuid`, `request_datetime_utc`, `request_method`, `resource_type`, `resource_id`, `request_body` (JSON) |
| `tbl_notifications` | Notifications | `id`, `user_id`, `created_datetime_utc`, `status`, `subject`, `message`, `url` |
| `tbl_new_users` | New users (pending activation) | `id`, `name`, `uuid`, `display_name`, `email`, `salt`, `password` |
| `tbl_verification_codes` | Verification codes | `id`, `recipient_email`, `verification_code`, `created_datetime_utc`, `expires_datetime_utc` |

**Security design**:
- Passwords are stored as salt + hash; plaintext passwords are never stored
- Supports account expiration and password expiration
- Supports limiting failed login attempts
- API keys support expiration times

**Development notes**:
- Password columns are stored in encrypted form; do not query them directly
- Session tokens should be cleaned up periodically to remove expired records
- Audit logs record all critical operations for security review
- Notification lifecycle: `unread` → `read` → `archived`

---

### 12. myems_reporting_db (Advanced Reporting Database)

**Purpose**: Stores email messages and attachments related to advanced reports.

**Characteristics**:
- Small data volume
- Supports advanced report templates and generated file storage

**Main table structures**:

| Table | Description | Key columns |
|------|-------------|-------------|
| `tbl_reports` | Advanced report configuration | `id`, `name`, `uuid`, `expression` (JSON), `is_enabled`, `last_run_datetime_utc`, `next_run_datetime_utc`, `is_run_immediately` |
| `tbl_reports_files` | Advanced report files | `id`, `uuid`, `create_datetime_utc`, `file_name`, `file_type` (xlsx/pdf/docx), `file_object` (LONGBLOB) |
| `tbl_template_files` | Advanced report template files | `id`, `uuid`, `report_id`, `file_name`, `file_type`, `file_object` |
| `tbl_email_messages` | Email messages | `id`, `recipient_name`, `recipient_email`, `subject`, `message`, `attachment_file_name`, `attachment_file_object`, `status` |

**Development notes**:
- Advanced report files support Excel, PDF, and Word formats
- Template files are used to generate advanced reports
- Advanced reports can be generated on a schedule or immediately
- Files are stored using `LONGBLOB`; be mindful of size limits

---

### 13. myems_production_db (Production Database)

**Purpose**: Stores production-related product data.

**Characteristics**:
- Small data volume
- Used for production-to-energy correlation analysis

**Main table structures**:

| Table | Description | Key columns |
|------|-------------|-------------|
| `tbl_products` | Products | `id`, `name`, `uuid`, `unit_of_measure`, `tag`, `standard_product_coefficient` |
| `tbl_teams` | Teams | `id`, `name`, `uuid`, `description` |
| `tbl_shifts` | Shifts | `id`, `shopfloor_id`, `team_id`, `product_id`, `product_count`, `start_datetime_utc`, `end_datetime_utc`, `reference_timestamp` |
| `tbl_shopfloor_hourly` | Shopfloor hourly production | `id`, `shopfloor_id`, `start_datetime_utc`, `product_id`, `product_count` |
| `tbl_space_hourly` | Space hourly production | `id`, `space_id`, `start_datetime_utc`, `product_id`, `product_count` |
| `tbl_shopfloors_products` | Shopfloor-to-product mapping | `id`, `shopfloor_id`, `product_id` |
| `tbl_shopfloors_teams` | Shopfloor-to-team mapping | `id`, `shopfloor_id`, `team_id` |

**Development notes**:
- Production data is used to compute energy consumption per unit product
- Supports statistics by product, team, shopfloor, etc.
- Correlates with energy data to compute efficiency indicators

---

## Data Flow

### Data acquisition flow

```
Devices/Sensors
    ↓ (Modbus TCP/MQTT/HTTP)
myems-modbus-tcp (Data acquisition service)
    ↓ (write)
myems_historical_db.tbl_analog_value / tbl_digital_value / tbl_energy_value
    ↓ (Normalization)
myems-normalization (Data normalization service)
    ↓ (Cleaning)
myems-cleaning (Data cleaning service)
    ↓ (Aggregation)
myems-aggregation (Data aggregation service)
    ↓ (write)
myems_energy_db (Energy data)
myems_billing_db (Billing data)
myems_carbon_db (Carbon data)
```

### Data query flow

```
User request
    ↓
myems-api (API service)
    ↓ (query)
myems_system_db (Configuration data)
myems_historical_db (Historical data)
myems_energy_db (Energy data)
    ↓ (return)
myems-web / myems-admin (Frontend)
```

### Data relationships

```
myems_system_db.tbl_points
    ↓ (point_id)
myems_historical_db.tbl_analog_value
    ↓ (aggregation)
myems_energy_db.tbl_meter_hourly
    ↓ (relation)
myems_system_db.tbl_meters
    ↓ (relation)
myems_system_db.tbl_equipments
    ↓ (relation)
myems_system_db.tbl_spaces
```

---

## Table Design Conventions

### Common columns

All tables contain the following common columns:

| Column | Type | Description |
|--------|------|-------------|
| `id` | BIGINT NOT NULL AUTO_INCREMENT | Primary key, auto-increment |
| `name` | VARCHAR(255) | Name |
| `uuid` | CHAR(36) | UUID for external system integration |
| `description` | VARCHAR(255) | Description (optional) |

### Time columns

| Column | Type | Description |
|--------|------|-------------|
| `utc_date_time` | DATETIME | UTC time (historical tables) |
| `start_datetime_utc` | DATETIME | Start time of the time window (aggregation tables) |
| `created_datetime_utc` | DATETIME | Created time |
| `updated_datetime_utc` | DATETIME | Updated time |
| `last_run_datetime_utc` | DATETIME | Last run time |
| `next_run_datetime_utc` | DATETIME | Next run time |

**Note**: All time columns are standardized on UTC; the frontend converts them to local time for display.

### Numeric columns

| Column | Type | Description |
|--------|------|-------------|
| `actual_value` | DECIMAL(21, 6) | Actual value, high precision (6 decimals) |
| `set_value` | DECIMAL(21, 6) | Setpoint |
| `rated_capacity` | DECIMAL(21, 6) | Rated capacity |
| `rated_power` | DECIMAL(21, 6) | Rated power |

### JSON columns

| Column | Type | Description |
|--------|------|-------------|
| `connection` | LONGTEXT | Connection settings (JSON format) |
| `expression` | LONGTEXT | Expression (JSON format) |
| `payload` | LONGTEXT | Payload (JSON format) |
| `data` | LONGTEXT | Data (JSON format) |

**Note**: JSON columns store formatted JSON strings and must be parsed before use.

### Status columns

| Column | Type | Description |
|--------|------|-------------|
| `is_enabled` | BOOL | Enabled flag |
| `is_active` | BOOL | Active flag |
| `is_bad` | BOOL | Bad data flag |
| `is_published` | BOOL | Published flag |
| `is_counted` | BOOL | Counted-in-statistics flag |
| `status` | VARCHAR(32) | Status (e.g., new, sent, done, error) |

### Index design

**Primary key index**:
- All tables have `PRIMARY KEY (id)`

**Unique indexes**:
- Key columns (such as `name`, `uuid`) typically have unique indexes

**Composite indexes**:
- Build composite indexes for frequently queried column combinations
- Example: `(point_id, utc_date_time)`, `(meter_id, start_datetime_utc)`

**Time indexes**:
- Time columns typically have standalone indexes to support time-range queries

---

## Development Notes

### 1. Time handling

- **All times are UTC**: Database storage and API responses use UTC time
- **Frontend conversion**: The frontend converts UTC to local time for display
- **Datetime format**: Use `DATETIME` with format `YYYY-MM-DD HH:MM:SS`
- **Timezone concerns**: Consider DST and timezone conversions

### 2. Data type selection

- **Numbers**: Use `DECIMAL(21, 6)` to ensure precision and avoid floating-point errors
- **Text**: Use `VARCHAR` for short text and `TEXT` / `LONGTEXT` for long text
- **JSON**: Use `LONGTEXT` to store JSON strings
- **Binary**: Use `LONGBLOB` to store files

### 3. Query optimization

- **Use indexes**: Prefer indexed columns in query predicates
- **Avoid full scans**: Avoid `SELECT *` on large tables
- **Pagination**: List endpoints must paginate to avoid returning huge payloads
- **Time ranges**: Historical queries must constrain time ranges

### 4. Transaction handling

- **Configuration data**: Use transactions on system configuration tables to ensure consistency
- **Historical data**: Typically avoids transactions to improve write throughput
- **Batch operations**: Use transactions for batch inserts; rollback on failure

### 5. Data consistency

- **Foreign keys**: System configuration tables use foreign keys to ensure consistency
- **Relational queries**: Use JOINs for related data rather than multiple round trips
- **Validation**: Validate data formats and ranges before writing

### 6. Performance considerations

- **Read/write separation**: Historical tables can support read/write separation
- **Partitioning**: Consider time-based partitioning for very large tables
- **Caching**: Cache configuration data and latest values when appropriate
- **Batch inserts**: Use `INSERT ... VALUES (...), (...), (...)` for batch inserts

### 7. Security considerations

- **SQL injection**: Use parameterized queries to prevent SQL injection
- **Password hashing**: Use salt + hash; never store plaintext passwords
- **Authorization**: API endpoints must enforce privilege checks
- **Data masking**: Do not log sensitive data (passwords, keys, etc.)

### 8. Error handling

- **Exception handling**: Catch exceptions around database operations
- **Error logging**: Record detailed error information for troubleshooting
- **Retry strategy**: Support retries for transient network errors
- **Degradation strategy**: Provide fallbacks when services are unavailable

---

## Installation and Upgrade

### Installation order

It is recommended to install databases in the following order:

1. **myems_system_db** - System configuration database
2. **myems_user_db** - User database
3. **myems_historical_db** - Historical data database
4. **myems_energy_db** - Energy database
5. **myems_billing_db** - Billing database
6. **myems_carbon_db** - Carbon database
7. **myems_energy_baseline_db** - Energy baseline database
8. **myems_energy_model_db** - Energy model database
9. **myems_energy_plan_db** - Energy plan database
10. **myems_energy_prediction_db** - Energy prediction database
11. **myems_fdd_db** - Fault detection and diagnosis database
12. **myems_reporting_db** - Advanced reporting database
13. **myems_production_db** - Production database

### Installation commands

```bash
# Enter the database installation directory
cd database/install

# Execute SQL scripts in order
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

### Database upgrade

Database upgrade scripts are located in the `database/upgrade/` directory and are named by version (e.g., `upgrade5.10.0.sql`).

Before upgrading:
1. **Back up databases**: You must back up all databases before upgrading
2. **Review upgrade notes**: Read the comments in the upgrade script
3. **Validate in staging**: Verify the script in a test environment first
4. **Upgrade in order**: Execute upgrade scripts in version order

### Database maintenance

- **Regular backups**: Recommended daily; keep at least 30 days of backups
- **Historical cleanup**: Periodically delete expired historical data to prevent oversized tables
- **Optimize tables**: Periodically run `OPTIMIZE TABLE` to optimize table structures
- **Monitor performance**: Monitor database performance to detect issues early

---

## Related Documents

- [MyEMS Official Documentation](https://myems.cn/docs/installation/database)
- [MyEMS API Documentation](./../myems-api/README.md)
- [MyEMS Data Acquisition Documentation](./../myems-modbus-tcp/README.md)
- [MyEMS Data Aggregation Documentation](./../myems-aggregation/README.md)
