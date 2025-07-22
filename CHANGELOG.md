# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]
### Added
- added myems-admin.conf and myems-web.conf for nginx
- added binding microgrid to space in myems-admin
- added blank page image for space mnvironment monitor in myems-web
- added quick mode for svg in myems-admin and myems-api
### Changed
- subspace names under the same parent space cannot be duplicated
- updated power stations
### Fixed
- fixed warnings in myems-web
- fixed warnings in myems-api
- fixed issue of pop message in myems-admin
- fixed issue of meter import function in myems-api
- fixed issue of virtual meter import function in myems-api
- fixed administrator access control issues of clone functions in myems-api
- fixed issue of data source in myems-admin
- fixed issue of virtual meter clone function in myems-api
- fixed issue of login failed message in myems-admin
- fixed issue of space import function in myems-api
- fixed issue of delete distribution system in myems-api
- fixed issue of add photovoltaic power station in myems-admin
- fixed issue of delete svg function in myems-api
- fixed issue of tanant editor in myems-admin
### Removed
- removed tbl_energy_storage_containers_sensors from myems_system_db in database


## [v5.6.0] - 2025-06-22
### Added
- added uuid file name pattern in myems-api/.gitignore
### Changed
- updated datasource in myems-admin
### Fixed
- fixed image path issues in readme.md
- fixed unused local symbols warnings in myems-api
- fixed warnings in myems-web
### Removed
- None

## [v5.5.0] - 2025-05-29
### Added
- added column definitions to tbl_points in databse
- added definitions to points in myems-api and myems-admin
### Changed
- None
### Fixed
- fixed inefficient regular expression in myems-web
- fixed comparison of identical values in myems-api
- fixed unused local variable in myems-api
### Removed
- removed hybrid power station


## [v5.4.0] - 2025-04-30
### Added
- added control modes and control times
- added legend to MultipleLineChart in myems-web
- added power integrator table in database
- added columns is_published to historical database
- added fuel integrator table in database
- added apipost file
### Changed
- replaced datetime.strftime() with datetime.isoformat() in myems-api
- changed space reports to automaticly submit in myems-web
- changed reporting period of space reports to one week in myems-web
- updated label interval of MultipleLineChart in myems-web
### Fixed
- fixed datetime isoformat issues in myems-api
- fixed api key datetime issue in myems-api and myems-admin
- fixed file is not always closed issue in myems-api
- fixed off-by-one comparison against length issue in myems-admin
- fixed on_delete action of point in myems-api
- fixed equipment and combiend equipment update isssue in myems-admin
- fixed distribution svg preview issue in myems-admin
### Removed
- removed postal code from power stations

## [v5.3.0] - 2025-03-28
### Added
- added space output data to dashboard in myems-web and myems-api
- added space prediction report in  myems-web and myems-api
- added new point type text_value to myems-admin and myems-api
### Changed
- updated microgrid and power stations
- updated myems-api/example.env (myems-api/.env in production eviroment)
- changed default color scheme to light in myems-web
- updated dashboard in myems-api and myems-web
### Fixed
- fixed issue in space statistics report
- fixed unused import issues in myems-api
- fixed unused local variable issues in myems-api
- fixed overwritten property issues in myems-admin
- fixed duplicate property issues in myems-admin
- fixed semicolon insertion issues in myems-web
- fixed unused variable, import, function or class issues in myems-web
- fixed data source clone issue in myems-api
### Removed
- None

## [v5.2.0] - 2025-02-25
### Added
- added portuguese language
- added deep valley to time-of-use tariff
- added optional langitude point, latitude point and svgs to power stations
- added hybrid power station
### Changed
- updated notification in myems-web
- updated realtime data title in myems-web
### Fixed
- fixed google map issue
- fixed redundant assignment
- fixed variable defined multiple times
- fixed meter comparison issue in myems-api
- fixed explicit returns mixed with implicit (fall through) returns
- fixed label issues of Excel exporter in myems-api
### Removed
- removed console.log from myems-web and myems-admin

## [v5.1.0] - 2025-01-29
### Added
- added new property 'faults' to point
- added `myems_historical_db`.`tbl_text_value` in database
- added `myems_historical_db`.`tbl_text_value_latest` in database
- added columns to `myems_fdd_db`.`tbl_web_messages` in database
### Changed
- changed length of decimal part of latitude and longitude to 10 in database
- updated notification in myems-web
- updated dockerfiles to reduce images size
- updated command actions in myems-api
- changed all DECIMAL(18, 3) to DECIMAL(21, 6) in database
- changed get the latest points value interval from 10 minutes to 30 minutes
- updated data recalculating scripts in database
### Fixed
- None
### Removed
- None

## [v4.12.0] - 2024-12-21
### Added
- added all in one docker files
- added associated equipments percentage data to combined equipment reports in myems-web
- added myems_energy_prediction_db to database
### Changed
- updated myems_energy_baseline_db, myems_energy_plan_db, myems_energy_model_db in database
- changed marker symbol from circle to auto in Excel exporter
- changed dLbls showVal to false in Excel exporter
### Fixed
- fixed gulp scss compile error in myems-web
### Removed
- removed myems_billing_baseline_db

## [v4.11.0] - 2024-11-23
### Added
- added tables for photovoltaic power stations in database
- added per capita data to dashboard and space reports
- added bind distribution system to space tab in myems-admin
- added bind photovoltaic power station to space tab in myems-admin
- added tables for wind farms and charging stations in database
- added equipment percentage to associated equipment table of combined equipment energy category report in myems-web
- added blank page background image for reports in myems-web
- added procedure to set process id in myems-modbut-tcp
### Changed
- updated myems_system_db.tbl_data_sources in database
- updated to hide connection of data source in myems-admin
- changed column order of datasource list in myems-admin
### Fixed
- fixed warn: fromascasing: 'as' and 'from' keywords' casing do not match in dockerfile
- fixed issues of clone object new name in myems-api
- fixed clear-text logging of sensitive information
- fixed overwritten property in myems-web
- fixed unused import in myems-api
### Removed
- removed google maps for picking up longtitude and latitude
- removed svg_id from energy storage container

## [v4.10.0] - 2024-10-26
### Added
- added ticket actions to myems-api
- added space production report
- added number of occupants to space
- added space cascader to energy flow diagram in myems-web
- added tbl_spaces_distribution_systems to system database
### Changed
- changed base docker image from python:silm to python:3.10-slim
- udpated demo database scripts
- changed mapbox zoom level to 10 (large roads)
### Fixed
- fixed wrong pop messages in myems-admin
- fixed issue of clone space in myems-api
### Removed
- None

## [v4.9.1] - 2024-10-05
### Added
- added myems_production_db config to example.env in myems-api
- added offset_constant to point
### Changed
- None
### Fixed
- fixed AttributeError of energy flow diagram in myems-api
- fixed npm install error by replacing node-sass with sass in myems-web
### Removed
- None

## [v4.9.0] - 2024-09-28
### Added
- added config entry to indicate if show TCE data on reports in myems-web
- added diagram to energy flow diagram excel exporter (need to rerun 'sudo pip install -r requirements.txt' to upgrade)
- added tbl_space_hourly to myems_production_db in database
- added new menu items
- added tbl_energy_storage_containers_firecontrols to myems_system_db in database
- added tbl_energy_storage_containers_hvacs to myems_system_db in database
- added tbl_spaces_energy_flow_diagrams to myems_system_db in database
- added enter prodction to myems-api and myems-web
### Changed
- updated energy storage power station reportings
- changed meter search box size to small
- updated tbl_energy_storage_containers_power_conversion_systems of myems_system_db in database
- updated tbl_energy_storage_containers_batteries of myems_system_db in database
- updated energy storage container actions in myems-api
- updated tbl_menus of myems_system_db in database
- updated routes in myems-web
- updated default start datetime utc from '2019-12-31 16:00:00' to '2021-12-31 16:00:00'
### Fixed
- fixed typo in myems-web routes
- fixed virtual point checkbox issue in myems-admin
- fixed issue of getting all points of data source in myems-api
- fixed issue of virtual point in myems-normalization
### Removed
- removed tbl_energy_storage_containers_sensors from myems_system_db in database
- removed sensors form energystoragecontainers in myems-api
- removed sensors from energystoragecontainers in myems-admin

## [v4.8.0] - 2024-08-13
### Warning
- **MUST** replace '/code/.env' with '/app/.env' in docker run commands because WORKDIR in Dockerfile was changed from '/code' to '/app'
### Added
- added clone action to energy storage container in myems-api
- added export action to energy storage container in myems-api
- added actions for protocol in myems-api
- added settings for protocol in myems-admin
- added space associated microgrids actions in myems-api
- added microgrid energy report
- added microgrid renevue report
- added microgrid carbon report
- added period type list automaticly adjustment logic in myems-web
- added config entry to indicate if show TCE data on dashboard in myems-web
### Changed
- updated protocols and data sources in database and myems-admin
- updated tariff price to keep 5 decimal places in database and myems-admin
### Fixed
- aligned timestamps of parameters for microgrid details report
- aligned timestamps of parameters for energy storage power station details report
- removed @staticmethod from __init__ methods in myems-api
### Removed
- None

## [v4.7.0] - 2024-07-08
### Warning
- This upgrade will delete svg from some tables, save svg source code to tbl_svgs or text file first
### Added
- added svg actions to myems-api, myems-admin
- added phase_of_lifecycle to microgird
- added work order (preview) to myems-web
- added new protocol mqtt-xintianli
- added protocols table to database
### Changed
- replaced svg with svg_id in combined equipment
- replaced svg with svg_id in distribution system
- replaced svg with svg_id in energy storage container
- replaced svg with svg_id in equipment
- replaced svg with svg_id in photovoltaic power station
- replaced svg with svg_id in virtual plant
- replaced svg with svg_id in wind farm
- replaced svg with svg_id in microgrid
- replaced svg with svg_id in energy storage power station
- set data result hidden by default for space reports in myems-web
- set data result hidden by default for equipment reports in myems-web
- set data result hidden by default for shopfloor reports in myems-web
- set data result hidden by default for store reports in myems-web
- set data result hidden by default for tenant reports in myems-web
- set data result hidden by default for combined equipment reports in myems-web
- set data result hidden by default for meter reports in myems-web
- set data result hidden by default for virtual meter reports in myems-web
- set data result hidden by default for offline meter reports in myems-web
### Fixed
- added check relations statements to point on_delete action in myems-api
- fixed issue of on_delete action in myems-api
### Removed
- None

## [v4.6.0] - 2024-06-09
### Added
- added energy plan files table to database
- added energy plan files actions to myems-api
- added energy plan files page to myems-admin
- added reading data from tbl_energy_value after reading data from tbl_analog_value for virtualpoint procedure
- added support for ojbect type ENERGY_VALUE to virtualpoint procedure in myems-normalization
- added columns to tbl_microgrids_power_conversion_systems in databas
- added columns to tbl_energy_storage_containers_power_conversion_systems in database
- added round2() function to avoid exceptions for builtin round()
- added phase_of_lifecycle to microgrid
- added phase_of_lifecycle to energy storage power station
- added energy storage power station reporting for revenue
- added schedules to energy storage containers and microgrids
### Changed
- updated energy storage container settings in myems-admin
- updated microgird settings in myems-admin
- simplified datetime format of parameter line chart for micrgorid and energy storage power station
- updated mqtt client to MQTTv5 in myems-api
### Fixed
- fixed totalRatedCapacity and totalRatedPower issue in microgrid dashboard and energy storage power station dashboard
- fixed issue of meter batch report in myems-api
- fixed issue of react-bootstrap-table-next in myems-web
### Removed
- removed charge/discharge points and commands from power conversion system of microgrid
- removed charge/discharge points and commands from power conversion system of energy storage container

## [v4.5.0] - 2024-05-21
### Added
- added new protocols dtu-rtu, dtu-tcp, dtu-mqtt and mqtt-zhongxian
- added latest value to data source points table in myems-admin
- added menus for plan functions in database
- added energy plan reports (preview) in myems-web
- added new tables for energy, billing and carbon in database
- added language zh_TW to myems-web, myems-admin and myems-api
### Changed
- updated Distribution System in myems-web
- limit virtual meter normalization procedure to calculate at most one month records
### Fixed
- fixed issues of optional svg textarea for equipment and combined equipment in myems-admin
- fixed translation issue for zh_CN in Excel exporter
### Removed
- None

## [v4.4.0] - 2024-04-17
### Added
- added hyperlink to meter name of Meter Batch report in myems-web
- added SectionLineChart into myems-web
- added start datetime, end datetime and update datetime to fdd webmessage
- added is_cost_data_displayed to microgrid and energy storage power station
- added energy storage power station relation to space in myems-api
- added myems energy plan database
- added cardsummary to fdd fault in myems-web
- added bind energy storage power station to space in myems-admin
- added energy plan reports in myems-api
- added advanced settings menu to myems-admin
### Changed
- changed map marker in myems-web
- updated popup style of mapbox in myems-web
- changed baidu map to mapbox for longitude and latitude
- chenged microgrid list alarm link to fdd fault
- changed query components size to small in myems-web
### Fixed
- added decimal data value range check to myems-modbus-tcp
- added missing lazy load files for router in myems-admin
### Removed
- None

## [v4.3.0] - 2024-03-11

### Added
- added protocol list to data source model in myems-admin
- added microgrid dashboard into myems-web
- added energy storage power station dashboard into myems-web and myems-api
- added tenant dashboard into myems-web and myems-api
- added store dashboard into myems-web and myems-api
- added shopfloor dashboard into myems-web and myems-api
- added space and microgrid relation table to database
- added space and energy storage power station relation table to database
### Changed
- updated space export, import and clone functions in myems-api
- updated microgrid reporting in myems-api and myems-web
- updated energy storage power station reporting in myems-api and myems-web
- updated columns of microgrid related tables in database, myems-admin and myems-api
- updated columns of energy storage power station related tables in database, myems-admin and myems-api
- updated column of wind farm related tables in database, myems-admin and myems-api
- updated column of photovoltaic power station related tables in database, myems-admin and myems-api
- changed the default menu to vertical in myems-web
### Fixed
- fixed chart issues in myems-web
- fixed warnings in myems-web
- fixed index issues in database
- fixed Duplicate property of translations in myems-admin
- fixed Superfluous trailing arguments in myems-web
- fixed Duplicate property of i18n in myems-web
- fixed Duplicate HTML element attributes in myems-admin
### Removed
- None

## [v4.2.0] - 2024-02-18

### Added
- None
### Changed
- updated distribution system export, import and clone functions in myems-api
- updated meter export, import and clone functions in myems-api
- updated equipment table in myems-admin
- updated combined equipment table in myems-admin
- updated equipment export, import and clone functions in myems-api
- updated combined equipment export, import and clone functions in myems-api
- updated shopfloor export, import and clone functions in myems-api
- updated store export, import and clone functions in myems-api
- updated tenant export, import and clone functions in myems-api
- updated run action of rule in myems-api
- updated run action of advanced report in myems-api
### Fixed
- fixed warnings in myems-web
- fixed issue of CardSummary in myems-web
- fixed issue of demo data in database
### Removed
- None

## [v4.1.0] - 2024-02-08

### Added
- added arrow up or arrow down icon to cardsummary in myems-web
- added sensor export, import and clone functions to myems-api, myems-admin
- added gateway export, import and clone functions to myems-api, myems-admin
- added equipment export, import and clone functions to myems-api, myems-admin
- added combined equipment export, import and clone functions to myems-api, myems-admin
- added shopfloor export, import and clone functions to myems-api, myems-admin
- added store export, import and clone functions to myems-api, myems-admin
- added tenant export, import and clone functions to myems-api, myems-admin
- added offline meter export, import and clone functions to myems-api, myems-admin
- added virtual meter export, import and clone functions to myems-api, myems-admin
- added space export, import and clone functions to myems-api, myems-admin
- added command export, import and clone functions to myems-api, myems-admin
- added energy flow diagram export, import and clone functions to myems-api, myems-admin
- added tariff export, import and clone functions to myems-api, myems-admin
- added working calendar export, import and clone functions to myems-api, myems-admin
- added virtual power plant export, import and clone functions to myems-api, myems-admin
- added wind farm export, import and clone functions to myems-api, myems-admin
- added rule export, import and clone functions to myems-api, myems-admin
- added photovoltaic power station export, import and clone functions to myems-api, myems-admin
- added advanced report config export, import and clone functions to myems-api, myems-admin
- added microgrid export, import and clone functions to myems-api, myems-admin
- added distribution system export, import and clone functions to myems-api, myems-admin
- added point export, import and clone functions to myems-api, myems-admin
### Changed
- None
### Fixed
- fixed unknown meter uuid of energy flow diagram links in demo database
### Removed
- None

## [v4.0.0] - 2024-01-13

### Added
- added tables for energy storage power station in database
- added energy storage power station actions to myems-api
- added energy storage power station UI to myems-admin
- added realtime data to DistribuitionSystem in myems-web
- added get coordinate links to myems-admin
- added interval_in_seconds to modbus-tcp data source definition in database and myems-modbus-tcp
- added energy storage container to database, myems-api and myems-admin
- added baidu map link and google maps link to get coordinate in myems-admin
- added cookieExpireTime to config.js in myems-web
- added background image to login page in myems-web
- added energy storage power station reports to myems-api and myems-web
- added data source export, import and clone functions to myems-api and myems-admin
- added energy storage power station export, import and clone actions to myems-api and myems-admin
- added copy api key token function to myems-admin
- added meter export, import and clone functions to myems-api and myems-admin
-
### Changed
- changed microgrid monitoring in myems-web
- changed Related Parameters to Operating Characteristic Curve in myems-web
- changed MultiTrendChart in myems-web
- updated demo tariffs in database
- updated view models in myems-admin
- resized svg editor in myems-admin
- updated translation of 'Description' in myems-admin
- moved mapbox access token from CustomizeMapBox.js to config.js in myems-web, you can get access token at https://mapbox.com, if you wnat to turn off online map feature, please set showOnlineMap to false
- updated WorkingDaysConsumptionTable in myems-web
- updated FalconCardHeader in myems-web
-
### Fixed
- fixed non-standard actions of microgrid in myems-api and myems-admin
- fixed empty qrcode issue when creating objects in myems-admin
- upgraded Font Awesome to v4.7.0 in myems-admin
- fixed api key save button issue in myems-admin
### Removed
-

## [v3.12.0] - 2023-12-08

### Added
- added charge time and discharge time settings to power conversion system of microgrid
- added nominal voltage to microgrid battery in database, myems-api and myems-admin
- added new supported protocol to datasource in myems-api
- added microgrid reporting to myems-web
### Changed
-
### Fixed
- fixed issues in on_delete actions of equipment, shopfloor, store and tenant in myems-api
- fixed issues of space and command views in myems-admin
- fixed issue of delete on point in myems-api
- fixed issue of menus in database
- fixed issue of aggregate_hourly_data_by_period in myems-api
- fixed issues of on_delete actions in myems-api
- fixed unused import issues in myems-api
-
### Removed
- Removed google map api from myems-admin

## [v3.11.0] - 2023-11-03
### Added
- added sensors realtime data to dashboard in myems-web
- added energy storage power station to database, myems-api, and myems-admin
- added photovoltaic power station to database, myems-api, and myems-admin
- added wind farm to database, myems-api, and myems-admin
- added serial number to microgrid
- added run state point to microgrid power conversion systems
- added battery state point to microgrid batteries

### Changed
- changed dropdown menu columns from 3 to 2 in myems-web

### Fixed
- refactored energy category reports to remove duplicated code in myems-web
- fixed issue on delete action of tariff in myems-api
- fixed issue on delete action of distribution system in myems-api, myems-admin
- fixed issue on delete action of virtual power plant in myems-api

### Removed
- removed tbl_microgrid_architecture_types from database
- removed tbl_microgrid_owner_types from database
- removed microgrid architecture types from myems-api and myems-admin
- removed microgrid owner types from myems-api and myems-admin
- removed wind turbine from microgrid
- removed svg column from list of microgrid in myems-admin
- removed svg column from list of virtual power plant farm in myems-admin
- removed svg column from list of energy storage power station in myems-admin
- removed svg column from list of photovoltaic power station in myems-admin
- removed svg column from list of wind farm in myems-admin

## [v3.10.0] - 2023-10-08
### Added
- added Vietnamese language to myems-web
- added sort function to tables in myems-admin
- added Thai language to myems-web
- added Indonesian language to myems-admin
- added Turkish language to myems-web
- added Malay language to myems-web
- added Indonesian language to myems-web
- added description property to gateway in database, myems-api and myems-admin
- added equipment energy category report hyperlink with equipment uuid to equipment tracking
- added description property to data source in database, myems-api and myems-admin
- added tenant energy category report hyperlink with uuid to tenant batch report
- added store energy category report hyperlink with uuid to store batch report
- added shopfloor energy category report hyperlink with uuid to shopfloor batch report
- added space energy category report hyperlink with uuid to space batch report
- added combined_equipment energy category report hyperlink with equipment uuid to combined-equipment batch report
- added equipment energy category report hyperlink with equipment uuid to equipment batch report
- added latitude and longitude to Space in database, myems-api and myems-admin
- added run immediately action to Advacned Report in database, myems-api and myems-admin
- added mapbox to display spaces on map in myems-web
- added run immediately action to FDD Rule in database, myems-api and myems-admin
- added microgrid list page to myems-web
### Changed
- changed user avator from emoji to image
### Fixed
- fixed microgrid-grid update issue
-
### Removed

## [v3.9.0] - 2023-09-06
### Added
- added SESSION_EXPIRES_IN_SECONDS config to myems-api
- added virtual power plant to database, myems-api and myems-admin
- added Russian language to myems-admin
- added higher limit and lower limit of point to myems-api and myems-admin
- added balancing price point to virtual power plant
- added French language to myems-web
- added Vietnamese language to myems-admin
- added Thai language to myems-admin
- added microgrid power conversion system to myems-api and myems-admin
- added api key control to get actions of core objects in myems-api
- added Spanish language to myems-web
- added Russian language to myems-web
- added Advanced Report Configs to myems-api
- added Turkish language to myems-admin
- added tbl_microgrids_users to myems_system_db in database
- added Arabic language to myems-web
- added bind user to microgrid function to myems-admin
- added Malay language to myems-admin
- added Advanced Report Setting to myems-admin
### Changed
- changed fdd rule template in myems-admin
- renamed tbl_microgrids_converters to tbl_microgrids_power_conversion_systems in database
-
### Fixed
- fixed sensor bound points issue in myems-admin
- fixed fdd category and fdd code relations in myems-admin
- fixed tariff editor issue in myems-admin
- fixed date range picker issue in myems-web
-
### Removed
- removed category and report_code from tbl_reports in myems_reporting_db

## [v3.8.0] - 2023-08-02
### Added
- added is_recursive boolean option to meter tracking report in myems-api (need to upgrade the myesm-api/.env file)
- added is_recursive boolean option to meter batch report in myems-api (need to upgrade the myesm-api/.env file)
- added soc point to microgrids batteries in database, myems-api and myems-admin
- added svg to combined equipment in database, myems-api and myems-admin
- added online map to dashboard in myems-web
- added enterprise edition mark to menus in myems-admin
- added svg to equipment in database, myems-api and myems-admin
- added bath delete and update actions for web messages in myems-api and myems-web
- added camera url to equipments and combined equipments in database
- added French language to myems-admin
- added Spanish language to myems-admin
- added offline meter data input to myems-web and myems-api

### Changed
- updated database demo scripts
- updated notification list style

### Fixed
- updated translations of API responses in myems-admin and myems-web
- fixed issue in querying meter start value of metertracking report in myems-api
- fixed display format issue for decimal value between 0.0 and 1.0 in meter realtime report
- fixed unable to redirect to login page issue when user session expires
- fixed issue of working calendar setting in myems-admin
- fixed issue of privilege setting in myems-admin

### Removed
- removed unnecessary error message at the first login in myems-web
- removed tenant equipments from monitoring
- removed shopfloor equipments from monitoring
- removed store equipments from monitoring

## [v3.7.0] - 2023-07-08
### Added
- added access control to tenant in myems-api, myems-admin and myems-web
- added point real time report to myems-api
- added access control to equipment in myems-api, myems-admin and myems-web
- added access control to combined equipment in myems-api, myems-admin and myems-web
- added access control to meter, offline meter and virtual meter in myems-api, myems-admin and myems-web
- added access control to space in myems-api, myems-admin and myems-web
- added access control to distribution system in myems-api, myems-admin and myems-web
- added access control to microgrid in myems-api, myems-admin and myems-web
- added access control to all core objects in myems-api, myems-admin and myems-web
- added api key access control to all reports in myems-api

### Changed
-
### Fixed
- fixed datetime picker issue in myems-web
- fixed ECharts DEPRECATE warning in myems-web

### Removed
- removed unused getXXX services from myems-admin


## [v3.6.0] - 2023-06-22
### Added
- added microgrid battery actions to myems-api and myems-admin
- added microgrid evcharger actions to myems-api and myems-admin
- added microgrid generator actions to myems-api and myems-admin
- added microgrid grid actions to myems-api and myems-admin
- added microgrid heatpump actions to myems-api and myems-admin
- added microgrid load actions to myems-api and myems-admin
- added microgrid photovoltaic actions to myems-api and myems-admin
- added microgrid windturbine to system database
- added microgrid windturbine actions to myems-api and myems-admin
- added get all associated objects of microgrid to myems-api
- added new access_control procedure to mymes-api
- added svg, inverters and converters to microgrid in system database
- added svg to microgrid in myems-api and myems-admin
- added API Key to database, myems-api and myems-admin
- added access control to shopfloor in myems-api, myems-admin and myems-web
- added access control to store in myems-api, myems-admin and myems-web

### Changed
- renamed access_control to admin_control in myems-api
- changed forgot password and user register processes

### Fixed
- fixed dialog doesn't close after myems-admin logging out automatically
- fixed warning of dependencies in myems-web

### Removed
- None

## [v3.5.0] - 2023-06-09
### Added
- added bind command to meter feature to myems-api and myems-admin
- added bind command to space feature to myems-api and myems-admin
- added forgot password function to myems-api and myems-web
- added user register function to myems-api and myems-web
- added postal code to microgrid in database, myems-api, myems-admin
- added bind command to equipment feature to myems-api and myems-admin
- added bind command to combined equipment feature to myems-api and myems-admin
- added new user approval function to myems-admin
- added bind command to tenant feature to myems-api and myems-admin
- added bind command to store feature to myems-api and myems-admin
- added bind command to shopfloor feature to myems-api and myems-admin
- added new tables for microgrids to system database
-
### Changed
- updated the default tariff type and default tariff valid through date time in tariff editor

### Fixed
- fixed save button issue of tariff dialog in myems-admin
- fixed save button issue of email server dialog in myems-admin
-
### Removed
- removed tariff type 'block'(or tiered) from database, myems-api and myems-admin
-
## [v3.4.0] - 2023-06-01
### Added
- added tbl_commands to myems_system_db database
- added tbl_combianed_equipments_commands to myems_system_db database
- added tbl_equipments_commands to myems_system_db database
- added tbl_meters_commands to myems_system_db database
- added tbl_microgrids_commands to myems_system_db database
- added tbl_spaces_commands to myems_system_db database
- added tbl_stores_commands to myems_system_db database
- added tbl_shopfloors_commands to myems_system_db database
- added tbl_tenants_commands to myems_system_db database
- added command actions to myems-api
- added command feature to myems-admin
- added tbl_new_users to myems_user_db database
- added tbl_email_messages and tbl_email_message_sessions to myems_user_db database

### Changed
- updated translations of myems-admin
- changed theme of BarChart and MultiTrendChart in myems-web
- swapped columns color in dashboard of myems-web
- compacted distribution system in myems-web
- updated supported protocols of datasource in myems-api

### Fixed
- fixed HTTPError Deprecated Warning in myems-api
- fixed edit user issue in myems-api
- fixed save button issue of energy item dialog in myems-admin
- fixed validator issue of equipment parameter form in myems-admin
- fixed validator issue of combined equipment parameter form in myems-admin
- fixed webpack-dev-server version 4.12.0 caused compile errors
- fixed save button issue of non-working-day dialog in myems-admin

### Removed
- None

## [v3.3.0] - 2023-05-21
### Added
- Added captcha to myems-web login form
- Added captcha to myems-admin login form
- Added higher limit and lower limit to tbl_points in database
- Added is_in_alarm to tbl_points in database
- Added new rule fdd codes to myems-admin
- Added data zoom to y axis of MultipleLineChart in myems-web

### Changed
- Updated English Translation in myems-admin
- Updated Meter, Point, User and Space editor dialogs in myems-admin
- Replaced telnetlib with telentlib3 in myems-modbus-tcp
- Added maximum limit of user password length

### Fixed
- Fixed typo in database
- Fixed typo of error description in myems-api
- Fixed errors when marking as read, acknowledging and deleteing alarms from myems-web

### Removed
- Removed legacy docs for readthedocs, and replaced with https://myems.io

## [v3.2.0] - 2023-03-31
### Added
- added automatic logout action when myems-admin is idle for more than 5 minutes
- Add Environment Monitor to Space Data

### Changed
- None

### Fixed
- None

### Removed
- Removed table `tbl_shopfloor_working_days` from `myems_production_db`

## [v3.1.0] - 2023-03-03
### Added
- added working-days/non-working-days data into tenant energy categroy report
- added working-days/non-working-days data into store energy categroy report
- added working-days/non-working-days data into shopfloor energy categroy report
- added automatic logout action when myems-admin is idle for more than 5 minutes

### Changed
- None

### Fixed
- fixed null tooltip issue in MultiTrendChart.js

### Removed
- None
-
## [v3.0.0] - 2023-02-25
### Added
- added tbl_spaces_non_working_days to myems_system_db database
- added tbl_working_calendars_non_working_days to myems_system_db database
- added tbl_shopfloors_working_calendars to myems_system_db database
- added tbl_spaces_working_calendars to myems_system_db database
- added tbl_stores_working_calendars to myems_system_db database
- added tbl_tenants_working_calendars to myems_system_db database
- added calendars and non-working-days settings to myems-admin
- added working-days/non-working-days data into space energy categroy report

### Changed
- upgraded bootstrap to v3.4.1 in myems-admin

### Fixed
- fixed make the implicitly inserted semicolon explicit in myems-web
- fixed use of AngularJS markup in URL-valued attribute in myems-admin
- fixed variable defined multiple times in myems-api
- fixed unused local variable in myems-api
- fixed semicolon insertion in myems-web
- fixed unused variable, import, function or class in myems-web
- fixed unused variable, import, function or class in myems-admin
- fixed semicolon insertion in myems-admin

### Removed
- removed access control from GET action of offlinemeterfile in myems-api

## [v2.11.0] - 2023-01-09
### Added
- added base period data to Combined Equipment reports
- added read only property to administrator
-
### Changed
- updated translations of API errors in myems-web
- updated myems-web to redirect URL to login page after 10 minutes of user idling
-
### Fixed
- fixed pagination caused issue in DetailedDataTable of myems-web
- fixed issue of increment_rate_saving in combined equipment saving report
-
### Removed
-

## [v2.10.0] - 2022-12-24
### Added
- added offline meter saving report
- added base period data to Tenant reports
- added child spaces percentage data to excel of spaceenergycategory report
- added base period data to Store reports
- added child spaces percentages to spaceenergycategory in myems-web
- added base period data to Shopfloor reports
-
### Changed
-
### Fixed
- fixed issue of increment_rate_saving in tenant saving report
- fixed issue of increment_rate_saving in equipment saving report
- fixed issue of increment_rate_saving in space saving report
- fixed issue of electricity time-of-use pie chart in Excel exporters
- fixed issue of increment_rate_saving in store saving report
- fixed quick mode issue in combinedequipmentoutput report
- fixed issue of increment_rate_saving in shopfloor saving report
-
### Removed
-

## [v2.9.0] - 2022-12-19
### Added
- added base period data to Equipment reports
- added base period data to Meter reports
- added base period data to Virtual Meter reports
- added base period data to Offline Meter reports
-
### Changed
- updated format statements by period types in execel exporters
- Replaced LineChart with MultipleLineChart for related parameters of space reports in myems-web
- Replaced LineChart with MultipleLineChart for related parameters of combined equipment reports in myems-web
-
### Fixed
- fixed user calendar cannot fully display issue
- fixed issues of comparing decimal with zero
- fixed issue of increment_rate_saving in meter saving report
-
### Removed
-

## [v2.8.0] - 2022-12-01
### Added
- added DateRangePickerWrapper to myems-web
- added base period data to Space Energy Category report
- added base period data to Space Energy Item report
- added base period data to Space Carbon report
- added base period data to Space Cost report
- added base period data to Space Efficiency report
- added base period data to Space Income report
- added base period data to Space Load report
- added base period data to Space Output report
- added base period data to Space Saving report
- added base period data to Space Statistics report
-
### Changed
- Changed basePeriodDateRangePickerDisabled from readonly to disabled
- Decreased web message drop down list length in myems-admin
- Replaced LGTM with CodeQL for code scanning in README
- Replaced LineChart with MultipleLineChart for related parameters of meter reports in myems-web
- Replaced LineChart with MultipleLineChart for trend data of meter trend report in myems-web
- Replaced LineChart with MultipleLineChart for related parameters of equipment reports in myems-web
- Replaced LineChart with MultipleLineChart for related parameters of store reports in myems-web
- Replaced LineChart with MultipleLineChart for related parameters of shopfloor reports in myems-web
- Replaced LineChart with MultipleLineChart for related parameters of tenant reports in myems-web
- Upgraded angular.js to v1.8.3 in myems-admin
-
### Fixed
- fixed File is not always closed
- fixed Explicit returns mixed with implicit (fall through) returns
- fixed Empty except in myems-api
- fixed Variable defined multiple times
- fixed Unused local variable in myems-api
-
### Removed
-

## [v2.7.0] - 2022-11-03
### Added
- added energy categories filter to meter tracking report
- added meter energy report hyperlink with meter uuid as query string
- added hyperlink to energy report page for all meters in meter tracking
- added updating latest value of virtul point in myems-normalization
- added difference values to meter comparison report
- added quickmode parameter to most APIs in myems-api
-
### Changed
- added translations of TARIFF in myems-api
- updated query panel of web messages in myems-admin
- replaced chartjs with echarts for MultipleLineChart in myems-web
-
### Fixed
- fixed error translations in myems-web
- added required parameters to webmessages api request in myems-admin
- fixed base period timestamps index out of range error in myems-api
- fixed PEP 8 warnings in myems-api
-
### Removed
-

## [v2.6.0] - 2022-10-20
### Added
- added API error message for failing to save offline meter file
- added base period data to meter enegy report excel exporter in myems-api
-
### Changed
- refactored base_period_start_datetime_local and reporting_period_start_datetime_local of all reports in myems-api
- normalized base period start datetime and reporting period start datetime of all reports in myems-api
- split bulk insert data into small ones for meter/offlinemeter/virtualmeter billing/carbon procedures in myems-aggregation
-
### Fixed
- fixed PEP 8: W605 invalid escape sequence Z in myems-api
- fixed finally statement issues in myems-aggregation
- fixed unclosed database connections issues in myems-api
- replaced unnecessary energy_category_list with single variable in myems-aggregation
-
### Removed
-

## [v2.5.0] - 2022-10-11

### Added
- added base period data and change rates to meter energy report in myems-web
- added filters to FDD alarm report and notifications in myems-web
-
### Changed
- Split batch inserts into small ones in myems-aggregation
- Updated min_datetime issue in myems-cleaning (NOTE: add START_DATETIME_UTC to myems-cleaning/.env for upgrading)
- Set access_log off in nginx.conf for myems-admin and myems-web (NOTE: modify myems-web/nginx.conf and myems-admin/nginx.conf for upgrading)
-
### Fixed
- updated translations in Excel exporters
- added try except statements to virtualmeter of myems-api
- fixed TypeError: Object of type IntegrityError is not JSON serializable in myems-api
- fixed wrong meter2 name in Excel exporter of MeterComparison report
-
### Removed
-

## [v2.4.0] - 2022-09-30
### Added
- added config entry to indicate if the tariff appended to parameters data (NOTE: add IS_TARIFF_APPENDED to myems-api/.env for upgrading)

### Changed
- changed table color in the Excel exporters
- refactored FDD Fault Alarm database, api and web
- updated child spaces data in Dashboard
- changed associated points query order in myems-api

### Fixed
- updated combined equipment energy category Excel exporter to show parameters data even if there is no energy data
- fixed wrong multiple energy categories in Excel exporters

### Removed
- None

## [v2.3.0] - 2022-09-23
### Added
- added i18n to excel exporters of store
- added i18n to excel exporters of tenant
- added i18n to excel exporters of shopfloor
- added i18n to excel exporters of combined equipment
- added difference value to meter tracking report
- added translation of TARIFF in myems-web
- added barchart to Dashboard in myems-web
- added translation of API errors in myems-web
-
### Changed
- updated ChildSpacesTable of Dashboard in myems-web
- updated FDD Faults Report in myems-web
-
### Fixed
- updated datetime picker format pattern
- fixed integrity rate issue of MeterTracking report
- fixed MultipleLineChart blank screen issue in myems-web
-
### Removed
-

## [v2.2.0] - 2022-09-18
### Added
- added i18n to excel exporters of space
- added i18n to excel exporters of meter
- added i18n to excel exporters of virtual meter
- added i18n to excel exporters of offline meter
- added i18n to excel exporters of equipment
- added OceanBase to README
-
### Changed
-
### Fixed
- updated if/else statements for excelexporters in myems-api
-
### Removed
-

## [v2.1.0] - 2022-09-09
### Added
- added MAX/MIN/AVG to parameters line charts
- added associated equipments trend data to combined equipment input energy category report
- added new protocol to datasource in myems-api
- added meter saving report
- added meter comparison report
- added virtual meter saving report
-
### Changed
- updated demo database
- updated docker build instruction in README
- updated daterange picker in myems-web
-
### Fixed
- fixed start datetime issue for virtual point in myems-normalization
-
### Removed
-

## [v2.0.0] - 2022-08-18

### Added
- added combined equipment carbon dioxide emissions report
- added equipment carbon dioxide emissions report
- added shopfloor carbon dioxide emissions report
- added store carbon dioxide emissions report
- added space carbon dioxide emissions report
- added tenant carbon dioxide emissions report
- added data repair file UI to myems-admin
### Changed
-
### Fixed
- fixed issues when energy item list refreshing with energy category in myems-admin
- fixed virtual meter editor issue when refreshing meter list with meter type in myems-admin
- fixed virtual point issue of conversion from Float to Decimal in myems-normalization
-
### Removed
-


## [v1.9.6] - 2022-08-05
### Added
- added data integrity rates to meter tracking report in myems-api & myems-web
- added piecewise function to virtual point in myems-normalization
-
### Changed
-
### Fixed
- fixed energy category index error of storebatch report in myems-api
- fixed setDetailedDataTableData async issue of meterenergy report in myems-web
- fixed warnings on mouse over by set rsuite version to 5.16.3 in myems-web
### Removed
-

## [v1.9.5] - 2022-07-18
### Added
- added subtotal to meter/offlinemeter/virtualmeter batch report
- added mqtt to data source protocol in myems-api
- added tbl_template_files to myems_reporting_db
- added tbl_integrators to myems_system_db
- added alarm audio for notification in myems-web
- added alarm lottie for notification in myems-web
- added tbl_data_repair_files to myems_historical_db
- added data repair file actions to myems-api
- added data repair file procedure to myems-normalization
-
### Changed
- changed parameter line chart to multiple line chart for meterenergy report in myems-web

### Fixed
- removed invalid ORDER BY clause from myems-api
- fixed point timestamps issue of metertrend report in myems-web
- fixed error of DELETE a Virtual Meter from Store in myems-api
- fixed error of GET a Parameter of an Equipment in myems-api
- fixed typo in postman collection
### Removed
-

## [v1.9.4] - 2022-06-18
### Added
- Added meter id column to virtual meter editor.
- Added virtual meter batch analysis report.
- Added offline meter batch analysis report.
- Added offline meter carbon dioxide emissions report.
- Added sums by time of use types to meter energy report.

### Changed
- Changed default user expiration datetime to one year from the creation.
- Reduced insert values length each time in myems-modbus-tcp service.
- Updated routes and menu items name in myems-web (Database Update Required).
- Updated translations of myems-admin.

### Fixed
- Fixed remove file error in user_logger decorator of myems-api.
- Fixed email address validator issue in myems-api.
- Reduced length of title in Excel exporters of carbon reports.

### Removed
- None.

## [v1.9.3] - 2022-06-03
### Added
- Added quick mode to meterenergy report in myems-api.
- Added quick mode to spaceenergycategory report in myems-api.
- Added quick mode to spaceload report in myems-api.
- Added object ID to editor title of model dialogs in myems-admin.
- Added ID column to MeterBatch report in myems-web.
- Added ID column to MeterTracking report in myems-api and myems-web.
- Added energy value point name to Meter RealtimeChart in myems-web.

### Changed
- Updated translations of myems-admin.
- Updated MeterTracking Excel exporter.
- Updated MeterBatch Excel exporter.
- Deleted width limit from cascader-menu in myems-web.
- Updated falcon web framework version to the latest (3.1.0) in myems-api

### Fixed
- updated meterrealtime report to display right units of energy value.

### Removed
- None.

## [v1.9.2] - 2022-05-22

### Added
- added bilibili link to README.

### Changed
- updated Dockerfile of myems-web.
- updated translations of myems-admin.
- updated modbus acquisition procedure.
- simplified database update queries in myems-cleaning.
- simplified database insert queries in myems-normalization.
- updated pagination of meterRealtime in myems-web.
- moved menu tariff settings upper than cost center settings in myems-admin.

### Fixed
- fixed wrong http status for XXX_NAME_IS_ALREADY_IN_USE.
- fixed tuple indices type error in metertracking report.

### Removed
- None.

## [v1.9.1] -   2022-05-05
### Added
- added API reverse proxy in Apache conf.

### Changed
- replaced true with 1 in SQL statements of myems-api.
- updated user insert sql statement for failed_login_count.
- updated icons for vertical menu items.
- updated acquisition procedure of myems-modbus-tcp.
- updated myems-web for SCADA visualization system.
- updated Dockerfile of myems-web.

### Fixed
- fixed typo in virtualmetercarbon.
- updated database upgrade1.4.0 sql script
- set proxy_buffering off in nginx.conf files.
- fixed row meters index error in meterbatch report api.

### Removed
- None.

## [v1.9.0] -   2022-04-16
### Added
- added myems_production_db to database.
- added column to `myems_production_db`.`tbl_teams` in database.
- added instruction for running myems-api with waitress on Windows.
- added nano to Dockfile.
- added telnet to Dockerfile.

### Changed
- renamed folder admin to myems-admin, and folder web to myems-web.
- updated nginx configs for myems-admin and myems-web.
- updated upload folder path.
- renamed index tbl_tariffs_index in database.
- replaced TRUE/FALSE with 1/0 in SQL statements in myems-cleaning service.
- replaced TRUE/FALSE with 1/0 in SQL statements in myems-normalization service.
- updated example.env for myems-normalization.
- replaced TRUE/FALSE with 1/0 in SQL statements in myems-aggregation service.
- replaced FALSE with 0 in SQL statements.
- changed linechart background color when web ui is in light mode.
- removed dictionary parameter from cursor in myems-cleaning service.
- removed dictionary parameter from cursor in myems-normalization service.
- updated database demo scripts.
- removed dictionary parameter from cursor of combinedequipment api functions.
- updated Dockerfile and README of Web UI.
- updated .env path for docker run in README.
- updated docker instruction in README.

### Fixed
- Fixed Meter list search and clear issue.
- moved cnx.close after cursor.close in useractivity.write_log procedure.
- fixed no such file error in admin ui.
- moved cursor.close before cnx.close in myems aggregation service.

### Removed
- Removed search box from navbar of web ui.

## [v1.8.2] -   2022-03-16
### Added
- None.

### Changed
- replaced cnx.disconnect() with cnx.close() according to PEP 249
- updated docker compose version to 3.8
- updated README
- renamed database files

### Fixed
- fixed common time slot issues in aggregation service

### Removed
- None.

## [v1.8.1] -   2022-03-05
### Added
- added integration testing plan to README
- added StreamHandler to send logging output to sys.stderr

### Changed
- replaced DateTime with DateRangePicker for Advanced reports in Web UI
- replaced DateTime with DateRangePicker for EnergyFlowDiagram in Web UI
- updated Tariff Editor in Admin UI

### Fixed
- None.

### Removed
- None.

## [v1.8.0] -   2022-02-28
### Added
- added Meter Carbon Dioxide Emissions Report to Web UI
- added Virtual Meter Carbon Dioxide Emissions Report

### Changed
- updated Dashboard report in Web UI
- updated README for docker
- added limit 1 to number of ENERGY_VALUE points of meter
- updated docker compose files for windows host and for linux host
- replaced DateTime with DateRangePicker for Meter reports in Web UI
- replaced DateTime with DateRangePicker for Space reports in Web UI
- replaced DateTime with DateRangePicker for Store reports in Web UI
- replaced DateTime with DateRangePicker for Tenant reports in Web UI
- replaced DateTime with DateRangePicker for Shopfloor reports in Web UI
- replaced DateTime with DateRangePicker for Equipment reports in Web UI
- replaced DateTime with DateRangePicker for CombinedEquipment reports in Web UI

### Fixed
- fixed TypeError cased by undefined decimal value in Web UI
- fixed issues in CombinedEquipmentEfficiency report and EquipmentEfficiency report

### Removed
-   None.

## [v1.7.2] -   2022-02-19
### Added
- added default character set and collate to database
- added Mark All As Read action to notification

### Changed
- updated docker-compose guide
- added DateRangePicker to MeterEnergy report in Web UI

### Fixed
- updated Notification of Web UI

### Removed
-   None.

## [v1.7.1] -   2022-02-11
### Added
- added myems_carbon_db to recalculating script

### Changed
- updated mysql-connector-python version in README
- updated installation guide in README
- updated docs
- updated comment of tbl_web_messages in database
- updated database upgrade scripts
- Bump node-sass from 6.0.1 to 7.0.0 in Web
- updated Web Message actions in API and Notification Page in Web UI
- updated POSTMAN file

### Fixed
- fixed issue of Notification in Web UI
- fixed issue of tbl_users in database

### Removed
-   None.

## [v1.7.0] -   2022-01-28
### Added
- added new database myems_carbon_db
- added alternative uuid parameter to reports of combined equipment, equipment, meter, shopfloor, store and tenant
- added meter carbon dioxide emission report to api
- added meter carbon dioxide emission aggregation procedure
- added virtual meter carbon dioxide emission aggregation procedure
- added offline meter carbon dioxide emission aggregation procedure

### Changed
- updated architecture images in README
- updated components images in docs

### Fixed
- fixed select statements issue in tenant reports.
- fixed fraction numerator and denominator issue in combinedequipmentefficiency and equipmentefficiency reports
- fixed issue of config in aggregation service
- fixed issue of carbon_dioxide_emission_factor in aggregation service
- fixed issues in README

### Removed
-   None.

## [v1.6.1] -   2022-01-18
### Added
- added docker image immigration to readme.
- added QRCode in String to Space/Meter/Store/Tenant/Equipment/CombinedEquipment in API

### Changed
- added alternative parameter meteruuid to meter reports
- updated docker installation in README
- improved virtual meter editor in admin ui.
- upgraded echarts version to 5.2.2 in web ui.

### Fixed
-   None.

### Removed
-   None.


## [v1.6.0] -   2021-12-31
### Added
-   added energy output and input to combined equipment efficiency report
-   added energy output and input to equipment efficiency report
-   added offline meter billing procedure to aggregation service
-   added virtual meter billing procedure to aggregation service
-   added PUT actions to text/wechat/email messages in api
-   added POST actions to create new email/wechat/text messages
-   added lock/unlock user who failed login some times to admin and api
-   added bind-mount upload file folder to containers of myems-api and admin

### Changed
-   updated dependencies in web ui
-   updated react-countup to v6.1.0 in web ui
-   updated Meter RealtimeChart in web ui
-   updated web for latest Node.js version
-   updated get messages by date range in admin and api
-   updated get emailmessages api in postman and readme
-   updated config.py in myems-aggregation service

### Fixed
-   None

### Removed
-   None.

## [v1.5.1] -   2021-12-18
### Added
-   Added lock/unlock user function if user failed login with wrong password.

### Changed
- Updated email message api and view with start/end datetime parameters.
- Changed all datatype JSON columns to datatype LONGTEXT in database.

### Fixed
-   None.

### Removed
-   None.

## [v1.5.0] -   2021-12-12
### Added
-   Added energy model database
-   Added access control to all core entities in api and admin ui.

### Changed
-   Updated notification(web message) in web and api
-   Updated command of myems-api service in docker-compose.
-   Updated Dockerfile of myems-api.
-   Updated virtual meter procedure in normalization service.

### Fixed
-   None.

### Removed
-   None.

## [v1.4.0] -   2021-11-14
### Added
-   added installation on docker to myems-modbus-tcp.

### Changed
-   Merged expression table into virtual meter table in database.
    NOTE: THIS CHANGE MAY BREAK YOUR SYSTEM.

    Upgrade procedure for this change:
    1. Stop the myems-normalization service or container.
    2. Backup your database.
    3. Upgrade myems/admin, myems/myems-api, and myems/myems-normalization source code,
       and keep previous .env files unchanged.
    4. Run database/upgrade/upgrade1.4.0.sql to merge expression into virtual meter
    5. Check the virtual meters in Admin UI.
    6. Start the myems-normalization service or container.

-   updated virtual meter model view in admin ui
-   updated docker hub address in README
-   updated excel exporters to make them print friendly
-   added access control to actions of user in api

### Fixed
-   fixed issue in on_delete of gateway in API
-   upgraded falcon framework to v3.0.1 in API to fix warnings

### Removed
-   None.

## [v1.3.4] -   2021-11-06
### Added
-   added notification drop down list and notification page.
-   added new period type 'weekly'.
-   added installation on docker to README.

### Changed
-   updated Dockerfiles.
-   added default gateway token to database and myems_modbus_tcp

### Fixed
-   fixed NoneType errors in detailed data formatters of Web UI.

### Removed
-   None.

## [v1.3.3] -   2021-10-30
### Added
-   added missing rule_id in myems_fdd_db.

### Changed
-   updated package.json in web ui
-   updated README and database test procedure
-   added validation of offline meter hourly values to myems-normalization service
-   updated offline meter data template file
-   added new period type 'weekly' to meterenergy and aggregate_hourly_data_by_period in API
-   updated comments in aggregate_hourly_data_by_period of API
-   updated myems-api installation.

### Fixed
-   fixed NoneType error in myems-cleaning service
-   fixed warnings in myems-aggregation service
-   fixed detailed data sort issues in Web UI

### Removed
-   removed duplicate entry in i18n of Web UI
-   removed unused import from API.

## [v1.3.2] -   2021-10-22
### Added
-   added associated equipments data to combinedequipmentefficiency report.
-   added Pie Charts of TCE/TCO2E to excelexporters of equipmentenergycategory, combinedequipmentenergycategory and storeenergycategory.
-   added Pie charts of TCE and TCO2E to excel exporter of shopfloorenergycategory report.
-   added validation for area of shopfloor, space, store and tenant in API.

### Changed
-   reformatted excel exporters of shopfloor reports.
-   reformatted excel exporters of store reports.
-   reformatted excel exporters of tenant reports
-   reformatted excel exporters of equipment reports
-   renamed parameter worksheet names in excel exporters.
-   updated database demo data in German.
-   updated Database Demo in English.

### Fixed
-   fixed PEP8 warnings.
-   fixed warnings in Excel exporters.

### Removed
-   Remove Child Space Data Section from EquipmentEnergyCategory Excel Exporter.
-   deleted unused comments from excelexporters.


## [v1.3.1] -   2021-10-15
### Added
-   added maximum load to tenantbatch report

### Changed
-   updated config.py files to move all variables to .env files via Python Decouple
-   modified the doc for docker-compose
-   updated database installation script and README
-   reformatted excel exporters
-   changed name font from Constantia to Arial in Excel exporters.

### Fixed
-   fixed error when opening CombinedEquipmentEfficiency Excel report
-   fixed issue for editing user name and password in Admin UI
-   fixed NoneType issues in ExcelExporters.

### Removed
-   None.

## [v1.3.0] -   2021-09-04
### Added
-   added expiration datetimes to User in Admin UI
-   added expiration datetimes to user actions in API
-   added expiration datetimes to user table in database
-   added column ID to StoreBatch Excel Exporter in API
-   added meter ID to meterbatch excel exporter in API
-   added new datasource protocols to API
-   added API error messages to translations.js and i18n.js
-   added spinners to Dashboard of Web UI.

### Changed
-   replaced Chinese with English in Excel Exporters of API
-   changed start&end datetime formatter for tariff from timestamp to strftime
-   changed lease start&end datetime formatter for tenant from timestamp to strftime
-   changed last run datetime and next run datetime formatter for rule from timestamp to strftime
-   changed last seen datetime formatter for gateway from timestamp to strftime
-   changed last seen datetime formatter of datasource from timestamp to strftime
-   changed upload datetime formatter of knowledgefile and offlinemeterfile from timestamp to strftime
-   changed cost file upload datetime formatter from timestamp to strftime
-   updated translation of Admin UI
-   updated database README
-   updated demo database for database ingestion service
-   updated distibutionssystem point value timeout value to 30 minutes
-   updated Admin UI to make error messages more specific
-   updated translations of KGCE & KGCO2E in Admin UI
-   updated userlogger in API to pass HTTPError to client.

### Fixed
-   fixed PEP8 warnings in API
-   fixed typo in contact controller of Admin UI
-   added try_files directive to avoid 404 error while refreshing pages in Web UI
-   modified API error message for knowledge file cannot be removed from disk.

### Removed
-   removed cookies usages from API

## [v1.2.3] -   2021-09-04
### Added
-   added tbl_reports to myems_reporting_db in database.
-   added trusted-host to Dockerfiles

### Changed
-   updated README.
-   renamed language cn to zh-cn in Admin UI

### Fixed
-   fixed Local Storage conflicts in Admin UI and Web UI .
-   fixed issues in database demo script

### Removed
-   None.

## [v1.2.2] -   2021-08-28
### Added
-   added user log to UserLogin, ChangePassword and ResetPassword in API
-   implemented user_logger decorators in API
-   added default passwords to README.

### Changed
-   updated myems_user_db.tbl_logs in database
-   updated i18n of WebUI
-   changed user token hash algorithm from sha1 to sha256 in API
-   upgraded dropzone js library in Admin UI
-   moved css files for dropzone from js folder to css folder in Admin UI

### Fixed
-   fixed code style warnings in README
-   fixed PEP8 warnings in API
-   fixed code style warnings in API
-   fixed translation errors in Admin UI
-   fixed issues of markdown in README files
-   fixed typeof issue of dropzone js in Admin UI
-   fixed issue of 'typeof' expression compared to 'null' in Web UI
-   fixed toaster issues for uploading file in Admin UI

### Removed
-   removed unnecessary dropzone-amd-module library from Admin UI

## [v1.2.1] -   2021-08-19
### Added
-   Added Missing Error Messages Words of API to Web UI i18n
-   Added rule_id to messages tables of fdd database
-   added version tags to images in Dockerfile

### Changed
-   renamed virtualmeter.model.html in Admin UI
-   replaced stateChangeStart with transitions.onStart in Admin UI
-   added filters for jstree action types of menu and space in Admin UI
-   updated README of Web UI
-   replaced href with ng-href in Admin UI
-   upgraded Highcharts JS to v9.1.2
-   upgraded jquery-ui to v1.12.1
-   updated Admin UI translations for Error Messages of API
-   upgraded ocLazyLoad to v1.0.10 in Admin UI
-   updated Dockerfiles to add pip mirrors
-   upgraded AngularJS to v1.8.2

### Fixed
-   removed unnecessary jc.jsextend library from Admin UI
-   fixed debugging code issues in Admin UI
-   fixed unused code issues in Admin UI
-   fixed self assignment error in Web UI
-   fixed 'Clear-text logging of sensitive information' in API
-   fixed 'The variable binary_file_data does not seem to be defined for all execution paths' in API
-   replaced == with === to avoid casting in Admin UI
-   fixed response body of Restore actions
-   fixed typos in database
-   fixed typo in API
-   fixed typo in demo data of database

### Removed
-   removed unused logs
-   removed diff-match-patch library from Admin UI
-   removed jeditable library from Admin UI
-   removed js plugins codemirror and summernote from Admin UI
-   removed 'unused import' from API
-   removed uncessary pass from acquisition.py of myems-modbus-tcp
-   removed unused import from meterbatch.py of API
-   removed unnecessary library mathjax from Admin UI
-   removed unnecessary libraries d3, and3, nvd3 and c3 from Admin UI
-   removed unnecessary library nggrid from Admin UI

## [v1.2.0] -   2021-08-08
### Added
-   Added demo data to database

### Changed
-   Replaced every_day_* to periodic_* in excelexporters of API
-   Updated Dockerfiles

### Fixed
-   Replaced every_day_* to periodic_* in excelexporters of API
-   Fixed data issues of tbl_menus in database

### Removed
-   Deleted unnecessary words in translations of Admin UI

## [v1.1.6] -   2021-08-02
### Added
-   Added Meter Batch Analysis Report
-   Added Child Space Share Pies for SpaceCost in Web UI
-   Added Web UI & Admin UI Installation Guide on Apache Web Server
-   Added Dockerfiles
-   Added Customized Menus in Web UI, API and Admin UI

### Changed
-   None.

### Fixed
-   Upgraded jquery to v2.2.4 in Admin UI

### Removed
-   None.

## [v1.1.5] -   2021-07-20
### Added
-   None.

### Changed
-   changed all worksheet names of Excel exporters in API

### Fixed
-   updated upgrade1.1.4 sql
-   fixed issue of gitignore in Admin UI

### Removed
-   None.

## [v1.1.4] -   2021-07-19
### Added
-   added tbl_email_messages to myems_reporting_db
-   added data sort to FDD messages in Admin UI
-   added new category to FDD rule in API & Admin UI
-   added Search Input for meters in Web UI
-   added last year data to dashboard
-   added ChildSpaceProportion SharePies to Space Energy Category report of Web UI
-   added ORDER BY utc_date_time to all digital parameters data in API
-   added the pagination for meter realtime page
-   added pagination to MeterRealtime in Web UI
-   added internationalization of Vertical Navigation Bar in Web UI
-   added Equipment Batch Analysis report API
-   added Cost File to API and Admin UI
-   added restore button to offline meter file in API and Admin UI

### Changed
-   changed GET Data Source Point Collection to order by ID
-   changed equipment and combined equipment associated points name to parameters name in reports API
-   updated validate expression of rule in API
-   updated i18n in Web UI
-   upgraded Web UI library to 2.10.2

### Fixed
-   fixed typo for deleting email messages in Admin UI
-   fixed issues of deleting text message and wechat message in Admin UI
-   fixed base period cost units issue of Dashboard API
-   fixed selected meter issues in onSearchMeter of Web UI
-   fixed wrong HTTP Status Code issues in API
-   fixed Child Space Share Pie issue in Excel exporter of spaceenergycategory

### Removed
-   Drop table tbl_sms_recipients from myems_fdd_db
-   deleted parameters data from Dashboard

## [v1.1.3] -   2021-05-25
### Added
-   added Combined Equipment Batch Analysis Report
-   added Shopfloor Batch Analysis Report
-   added Store Batch Analysis Report
-   added Tenant Batch Analysis Report
-   implemented virtual point calculating in myems-normalization service
-   added is_virtual to tbl_points in database
-   added gateway process to myems-modbus-tcp service
-   added gateway process to myems-bacnet service
-   added procedure to update last seen datetime of data source in myems-modbus service
-   added last seen datetime to data source setting in Admin UI
-   added last seen datetime to Gateway Setting in Admin UI
-   added excel exporter of spaceefficiency report in API

### Changed
-   updated Dashboard in web to display energy data of this year
-   updated tbl_expressions in database
-   added start value and end value to metertracking report
-   updated comments and log messages in myems-modbus-tcp service
-   improved theme of energyflowdiagram in Web UI

### Fixed
-   updated metertracking report to reduce duplicated meters
-   fixed detailed value missing issue in SpaceEfficiency report in Web UI

### Removed
-   None.

## [v1.1.2] -   2021-04-23
### Added
-   added associated parameters data to excel exporter of shopfloorstatistics in API
-   added associated parameters data to excel exporter of shopfloorsaving in API
-   added associated parameters data to excel exporter of shopfloorload in API
-   added associated parameters data to excel exporter of shopfloorenergyitem in API
-   added associated parameters data to excel exporter of shopfloorenergycategory in API
-   added associated parameters data to excel exporter of shopfloorcost in API
-   added associated parameters data to excel exporter of storestatistics in API
-   added associated parameters data to excel exporter of storesaving in API
-   added associated parameters data to excel exporter of storeload in API
-   added associated parameters data to storeenergyitem in API
-   added associated parameters data to excel exporter of storeenergycategory in API
-   added associated parameters data to excel exporter of storecost in API
-   added associated parameters data to excel exporter of spacestatistics in API
-   added associated parameters data to excel exporter of spacesaving in API
-   added associated parameters data to excel exporter of spaceoutput in API
-   added associated parameters data to excel exporter of spaceload in API
-   added associated parameters data to excel exporter of spaceincome in API
-   added associated parameters data to excel exporter of spaceenergyitem in API
-   added associated parameters data to excel exporter of spaceenergycategory in API
-   added associated parameters data to excel export of spacecost in API
-   added associated parameters data to excel exporter of metertrend in API
-   added associated parameters data to excel exporter of meterenergy in API
-   added associated parameters data to excel exporter of metersubmetersbalance in API
-   added parameters data to excel exporter of metercost in API
-   added associated parameters data to excel exporter of tenantstatistics in API
-   added associated parameters data to excel exporter of tenantsaving in API
-   added associated parameters data to excel exporter of tenantload in API
-   added associated parameters data to excel exporter of tenantenergyitem in API
-   added associated parameters data to excel exporter of tenantenergycategory in API
-   added associated parameters data to excel exporter of tenantcost in API
-   added associated parameters data to excel exporter of combinedequipmentstatistics in API
-   added associated parameters data to combinedequipmentsaving in API
-   added associated parameters data to combinedequipmentload in API
-   added associated parameters data to combinedequipmentoutput in API
-   added associated parameters data to combinedequipmentincome in API
-   added associated parameters data to combinedequipmentenergyitem in API
-   added associated parameters data to combinedequipmentenergycategory in API
-   added associated parameters data to combinedequipmentcost in API
-   added quickmode to HTTP request parameters of MeterTrend report in API
-   added parameter data to excel exporter of EquipmentStatistics in API
-   added parameter data to excel exporter of EquipmentSaving in API
-   added parameter data to excel exporter of EquipmentOutput in API
-   added parameter data to excel exporter of EquipmentLoad in API
-   added parameters data to excel exporter of EquipmentEnergyItem in API
-   added parameters data to excel exporter of EquipmentEnergyCategory in API

### Changed
-   updated README
-   updated excel exporter of metersubmetersbalance in API
-   updated excel exporter of meterenergy in API
-   updated excel exporter of metercost in API
-   updated panel width and height of costcenter in Admin UI
-   updated panel width and height of combinedequipment view in Admin UI
-   updated panel width and height of equipment view in Admin UI
-   changed query form column width from auto to xs={6} sm={3} in Web UI

### Fixed
-   fixed issues in excel exporters of combinedequipment in API
-   added parameters validator to statistics_hourly_data_by_period in API
-   added code to validate parameters of averaging_hourly_data_by_period in API
-   fixed issue in Excel exporter of equipmentincome in API
-   fixed unit issue in CombinedEquipmentCost report in API


### Removed
-   deleted slim-scroll from and added maxheight to panel of views in Admin UI


## [v1.1.1] -   2021-03-31
### Added
-   added associated equipment data to CombinedEquipmentCost report in API
-   added associated equipment data to CombinedEquipmentStatistics report in API
-   added associated equipment data to CombinedEquipmentSaving report in API
-   added associated equipment data to CombinedEquipmentOutput report in API
-   added associated equipment data to CombinedEquipmentLoad report in API
-   added associated equipment data to CombinedEquipmentIncome report in API
-   added associated equipment data to CombinedEquipmentEnergyItem report in API
-   added associated equipment data to CombinedEquipmentEnergyCategory report in API
-   added quickmode parameter to combinedequipmentefficiency report in API
-   added associated equipment data to CombinedEquipmentStatistics in Web UI
-   added associated equipment data to CombinedEquipmentLoad in Web UI
-   added excel exporter of equipmentcost reporter in API
-   added associated equipment data to CombinedEquipmentEnergyItem report in API
-   added AssociatedEquipmentTable to CombinedEquipmentIncome Report in web UI
-   added AssociatedEquipmentTable to CombinedEquipmentSaving Report in web UI
-   added AssociatedEquipmentTable to CombinedEquipmentOutput Report in web UI
-   added AssociatedEquipmentTable to CombinedEquipmentIncome Report in web UI
-   added AssociatedEquipmentTable to CombinedEquipmentCost Report in web UI
-   added AssociatedEquipmentTable to CombinedEquipmentEnergyCategory Report in web UI
-   added AssociatedEquipmentTable to CombinedEquipmentEnergyItem Report in web UI
-   added last_run_datetime and next_run_datetime to rule in API
-   added Deutsch (German) login language list in admin UI

### Changed
-   reduced font size of meterrealtime in Web UI
-   moved category before fdd_code of rule in admin UI and API

### Fixed
-   fixed omission mistakes in myems-cleaning
-   fixed error for large number of parameters in combinedequipmentefficiency and equipmentefficiency in API
-   fixed error of None Comparison in API
-   fixed NoneType error in all Load reports API.

### Removed
-   None.


## [v1.1.0] -   2021-03-18
### Added
-   added excel exporter of equipmentefficiency report.
-   added excel exporter of conbinedequipmentefficiency report in API.
-   added 'optional' tips to meter,virtual meter and offline meter setting in admin UI.
-   added Optional key to translation in admin UI.
-   added cominbedequipmentefficiency report to api and web.
-   added equipmentefficiency report api.

### Changed
-   updated cost file controller in admin UI
-   updated user login session expire time to 8 hours.
-   changed web UI and API to set contact of space is optional.

### Fixed
-   fixed http headers issues of offlinemeterfile, knowledgefile and costfile in admin UI
-   changed float datatype to Decimal datatype for offline meter normalization.
-   fixed issue of add space in web UI.
-   added historical database close and disconnect at the end of reports.

### Removed
-   None.

## [v1.0.8] -   2021-03-11
### Added
-   added excel exporter of combinedequipmentstatistics report
-   added translation for German
-   added excel exporter of storesaving report
-   added excel exporter of equipmentincome report
-   added excel exporter of shopfloorsaving report
-   added excel exporter of equipmentload report

### Changed
-   Changed default reporting range in EnergyFlowDiagram.

### Fixed
-   None.

### Removed
-   None.

## [v1.0.7] -   2021-03-07
### Added
-   added excel exporter of storeload report
-   added excel exporter of spaceincome report
-   added excel exporter of equipmentsaving report
-   added excel exporter of combinedequipmentsaving report
-   added excel exporter of combinedequipmentload report
-   added excel exporter of spaceoutput report
-   added excel exporter of combinedequipmentoutput
-   added excel exporter of combinedequipmentcost report
-   added excel exporter of shopfloorcost report
-   added excel exporter of shopfloorload report
-   added excel exporter of combinedequipmentenergycategory report
-   added excel exporter of combinedequipmentitem report.
-   added excel exporter of equipmentenergyitem report.
-   added excel exporter of equipmentenergycategory report.
-   added excel exporter of shopfloorenergyitem report.

### Changed
-   None.

### Fixed
-   fixed wrong HTTP headers in admin.
-   fixed typo in combinedequipment controller in admin.
-   fixed energy item undefined issue when edit virtual meter and offline meter.

### Removed
-   removed 'required' property from equipment model in admin.

## [v1.0.6] -   2021-02-26
### Added
-   added store statistics report excel exporter.
-   added equipment tracking excel exporter.
-   added store cost report excel exporter.
-   added equipment statistics report excel exporter.
-   added store energy item report excel exporter.
-   added shopfloor statistics report excel exporter.
-   merged myems-api.

### Changed
-   modified database table tbl_energy_flow_diagrams_links

### Fixed
-   fixed energy category names and units issue in EnergyItem reports.

### Removed
-   None.

## [v1.0.5] -   2021-02-23
### Added
-   None.

### Changed
-   None.

### Fixed
-   None.

### Removed
-   None.

[Unreleased]: https://gitee.com/MyEMS/myems/compare/v5.6.0...HEAD
[5.6.0]: https://gitee.com/MyEMS/myems/compare/v5.5.0...v5.6.0
[5.5.0]: https://gitee.com/MyEMS/myems/compare/v5.4.0...v5.5.0
[5.4.0]: https://gitee.com/MyEMS/myems/compare/v5.3.0...v5.4.0
[5.3.0]: https://gitee.com/MyEMS/myems/compare/v5.2.0...v5.3.0
[5.2.0]: https://gitee.com/MyEMS/myems/compare/v5.1.0...v5.2.0
[5.1.0]: https://gitee.com/MyEMS/myems/compare/v4.12.0...v5.1.0
[4.12.0]: https://gitee.com/MyEMS/myems/compare/v4.11.0...v4.12.0
[4.11.0]: https://gitee.com/MyEMS/myems/compare/v4.10.0...v4.11.0
[4.10.0]: https://gitee.com/MyEMS/myems/compare/v4.9.1...v4.10.0
[4.9.1]: https://gitee.com/MyEMS/myems/compare/v4.9.0...v4.9.1
[4.9.0]: https://gitee.com/MyEMS/myems/compare/v4.8.0...v4.9.0
[4.8.0]: https://gitee.com/MyEMS/myems/compare/v4.7.0...v4.8.0
[4.7.0]: https://gitee.com/MyEMS/myems/compare/v4.6.0...v4.7.0
[4.6.0]: https://gitee.com/MyEMS/myems/compare/v4.5.0...v4.6.0
[4.5.0]: https://gitee.com/MyEMS/myems/compare/v4.4.0...v4.5.0
[4.4.0]: https://gitee.com/MyEMS/myems/compare/v4.3.0...v4.4.0
[4.3.0]: https://gitee.com/MyEMS/myems/compare/v4.2.0...v4.3.0
[4.2.0]: https://gitee.com/MyEMS/myems/compare/v4.1.0...v4.2.0
[4.1.0]: https://gitee.com/MyEMS/myems/compare/v4.0.0...v4.1.0
[4.0.0]: https://gitee.com/MyEMS/myems/compare/v3.12.0...v4.0.0
[3.12.0]: https://gitee.com/MyEMS/myems/compare/v3.11.0...v3.12.0
[3.11.0]: https://gitee.com/MyEMS/myems/compare/v3.10.0...v3.11.0
[3.10.0]: https://gitee.com/MyEMS/myems/compare/v3.9.0...v3.10.0
[3.9.0]: https://gitee.com/MyEMS/myems/compare/v3.8.0...v3.9.0
[3.8.0]: https://gitee.com/MyEMS/myems/compare/v3.7.0...v3.8.0
[3.7.0]: https://gitee.com/MyEMS/myems/compare/v3.6.0...v3.7.0
[3.6.0]: https://gitee.com/MyEMS/myems/compare/v3.5.0...v3.6.0
[3.5.0]: https://gitee.com/MyEMS/myems/compare/v3.4.0...v3.5.0
[3.4.0]: https://gitee.com/MyEMS/myems/compare/v3.3.0...v3.4.0
[3.3.0]: https://gitee.com/MyEMS/myems/compare/v3.2.0...v3.3.0
[3.2.0]: https://gitee.com/MyEMS/myems/compare/v3.1.0...v3.2.0
[3.1.0]: https://gitee.com/MyEMS/myems/compare/v3.0.0...v3.1.0
[3.0.0]: https://gitee.com/MyEMS/myems/releases/tag/v3.0.0

