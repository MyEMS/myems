# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]
### Added
- added tbl_spaces_non_working_days to myems_system_db in database

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

[Unreleased]: https://github.com/MyEMS/myems/compare/v2.11.0...HEAD
[2.11.0]: https://github.com/MyEMS/myems/compare/v2.10.0...v2.11.0
[2.10.0]: https://github.com/MyEMS/myems/compare/v2.9.0...v2.10.0
[2.9.0]: https://github.com/MyEMS/myems/compare/v2.8.0...v2.9.0
[2.8.0]: https://github.com/MyEMS/myems/compare/v2.7.0...v2.8.0
[2.7.0]: https://github.com/MyEMS/myems/compare/v2.6.0...v2.7.0
[2.6.0]: https://github.com/MyEMS/myems/compare/v2.5.0...v2.6.0
[2.5.0]: https://github.com/MyEMS/myems/compare/v2.4.0...v2.5.0
[2.4.0]: https://github.com/MyEMS/myems/compare/v2.3.0...v2.4.0
[2.3.0]: https://github.com/MyEMS/myems/compare/v2.2.0...v2.3.0
[2.2.0]: https://github.com/MyEMS/myems/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/MyEMS/myems/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/MyEMS/myems/compare/v1.9.6...v2.0.0
[v1.9.6]: https://github.com/MyEMS/myems/compare/v1.9.5...v1.9.6
[v1.9.5]: https://github.com/MyEMS/myems/compare/v1.9.4...v1.9.5
[v1.9.4]: https://github.com/MyEMS/myems/compare/v1.9.3...v1.9.4
[v1.9.3]: https://github.com/MyEMS/myems/compare/v1.9.2...v1.9.3
[v1.9.2]: https://github.com/MyEMS/myems/compare/v1.9.1...v1.9.2
[v1.9.1]: https://github.com/MyEMS/myems/compare/v1.9.0...v1.9.1
[v1.9.0]: https://github.com/MyEMS/myems/compare/v1.8.2...v1.9.0
[v1.8.2]: https://github.com/MyEMS/myems/compare/v1.8.1...v1.8.2
[v1.8.1]: https://github.com/MyEMS/myems/compare/v1.8.0...v1.8.1
[v1.8.0]: https://github.com/MyEMS/myems/compare/v1.7.2...v1.8.0
[v1.7.2]: https://github.com/MyEMS/myems/compare/v1.7.1...v1.7.2
[v1.7.1]: https://github.com/MyEMS/myems/compare/v1.7.0...v1.7.1
[v1.7.0]: https://github.com/MyEMS/myems/compare/v1.6.1...v1.7.0
[v1.6.1]: https://github.com/MyEMS/myems/compare/v1.6.0...v1.6.1
[v1.6.0]: https://github.com/MyEMS/myems/compare/v1.5.1...v1.6.0
[v1.5.1]: https://github.com/MyEMS/myems/compare/v1.5.0...v1.5.1
[v1.5.0]: https://github.com/MyEMS/myems/compare/v1.4.0...v1.5.0
[v1.4.0]: https://github.com/MyEMS/myems/compare/v1.3.4...v1.4.0
[v1.3.4]: https://github.com/MyEMS/myems/compare/v1.3.3...v1.3.4
[v1.3.3]: https://github.com/MyEMS/myems/compare/v1.3.2...v1.3.3
[v1.3.2]: https://github.com/MyEMS/myems/compare/v1.3.1...v1.3.2
[v1.3.1]: https://github.com/MyEMS/myems/compare/v1.3.0...v1.3.1
[v1.3.0]: https://github.com/MyEMS/myems/compare/v1.2.3...v1.3.0
[v1.2.3]: https://github.com/MyEMS/myems/compare/v1.2.2...v1.2.3
[v1.2.2]: https://github.com/MyEMS/myems/compare/v1.2.1...v1.2.2
[v1.2.1]: https://github.com/MyEMS/myems/compare/v1.2.0...v1.2.1
[v1.2.0]: https://github.com/MyEMS/myems/compare/v1.1.6...v1.2.0
[v1.1.6]: https://github.com/MyEMS/myems/compare/v1.1.5...v1.1.6
[v1.1.5]: https://github.com/MyEMS/myems/compare/v1.1.4...v1.1.5
[v1.1.4]: https://github.com/MyEMS/myems/compare/v1.1.3...v1.1.4
[v1.1.3]: https://github.com/MyEMS/myems/compare/v1.1.2...v1.1.3
[v1.1.2]: https://github.com/MyEMS/myems/compare/v1.1.1...v1.1.2
[v1.1.1]: https://github.com/MyEMS/myems/compare/v1.1.0...v1.1.1
[v1.0.8]: https://github.com/MyEMS/myems/compare/v1.0.8...v1.1.0
[v1.0.8]: https://github.com/MyEMS/myems/compare/v1.0.7...v1.0.8
[v1.0.7]: https://github.com/MyEMS/myems/compare/v1.0.6...v1.0.7
[v1.0.6]: https://github.com/MyEMS/myems/compare/v1.0.5...v1.0.6
[v1.0.5]: https://github.com/MyEMS/myems/releases/tag/v1.0.5

