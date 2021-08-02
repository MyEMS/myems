# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]
### Added
- None.

### Changed
- None.

### Fixed
- None.

### Removed
- None.

## [v1.1.6] - 2021-08-02
### Added
- Added Meter Batch Analysis Report
- Added Child Space Share Pies for SpaceCost in Web UI
- Added Web UI & Admin UI Installation Guide on Apache Web Server
- Added Docerfiles
- Added Customized Menus in Web UI, API and Admin UI

### Changed
- None.

### Fixed
- Upgraded jquery to v2.2.4 in Admin UI

### Removed
- None.

## [v1.1.5] - 2021-07-20
### Added
- None.

### Changed
- changed all worksheet names of Excel exporters in API

### Fixed
- updated upgrade1.1.4 sql
- fixed issue of gitignore in Admin UI

### Removed
- None.

## [v1.1.4] - 2021-07-19
### Added
- added tbl_email_messages to myems_reporting_db
- added data sort to FDD messages in Admin UI
- added new category to FDD rule in API & Admin UI
- added Search Input for meters in Web UI
- added last year data to dashboard
- added ChildSpaceProportion SharePies to Space Energy Category report of Web UI
- added ORDER BY utc_date_time to all digital parameters data in API
- added the pagination for meter realtime page
- added pagination to MeterRealtime in Web UI
- added internationalization of Vertical Navigation Bar in Web UI
- added Equipment Batch Analysis report API
- added Cost File to API and Admin UI
- added restore button to offline meter file in API and Admin UI

### Changed
- changed GET Data Source Point Collection to order by ID
- changed equipment and combined equipment associated points name to parameters name in reports API
- updated validate expression of rule in API
- updated i18n in Web UI
- upgraded Web UI library to 2.10.2

### Fixed
- fixed typo for deleting email messages in Admin UI
- fixed issues of deleting text message and wechat message in Admin UI
- fixed base period cost units issue of Dashboard API
- fixed selected meter issues in onSearchMeter of Web UI
- fixed wrong HTTP Status Code issues in API
- fixed Child Space Share Pie issue in excel exporter of spaceenergycategory

### Removed
- Drop table tbl_sms_recipients from myems_fdd_db
- deleted parameters data from Dashboard

## [v1.1.3] - 2021-05-25
### Added
- added Combined Equipment Batch Analysis Report
- added Shopfloor Batch Analysis Report
- added Store Batch Analysis Report
- added Tenant Batch Analysis Report
- implemented virtual point calculating in myems-normalization service
- added is_virtual to tbl_points in database
- added gateway process to myems-modbus-tcp service
- added gateway process to myems-bacnet service
- added procedure to update last seen datetime of data source in myems-modbus service
- added last seen datetime to data source setting in Admin UI
- added last seen datetime to Gateway Setting in Admin UI
- added excel exporter of spaceefficiency report in API

### Changed
- updated Dashboard in web to display energy data of this year
- updated tbl_expressions in database
- added start value and end value to metertracking report
- updated comments and log messages in myems-modbust-tcp service
- improved theme of energyflowdiagram in Web UI

### Fixed
- updated metertracking report to reduce duplicated meters
- fixed detailed value missing issue in SpaceEfficiency report in Web UI

### Removed
- None.

## [v1.1.2] - 2021-04-23
### Added
- added assoicated parameters data to excel exporter of shopfloorstatistics in API
- added associated parameters data to excel exporter of shopfloorsaving in API
- added associated parameters data to excel exporter of shopfloorload in API
- added associated parameters data to excel exporter of shopfloorenergyitem in API
- added associated parameters data to excel exporter of shopfloorenergycategory in API
- added associated parameters data to excel exporter of shopfloorcost in API
- added associated parameters data to excel exporter of storestatistics in API
- added associated parameters data to excel exporter of storesaving in API
- added associated parameters data to excel exporter of storeload in API 
- added associated parameters data to storeenergyitem in API 
- added associated parameters data to excel exporter of storeenergycategory in API
- added associated parameters data to excel exporter of storecost in API
- added associated parameters data to excel exporter of spacestatistics in API
- added associated parameters data to excel exporter of spacesaving in API
- added associated parameters data to excel exporter of spaceoutput in API
- added associated parameters data to excel exporter of spaceload in API
- added associated parameters data to excel exporter of spaceincome in API
- added associated parameters data to excel exporter of spaceenergyitem in API
- added associated parameters data to excel exporter of spaceenergycategory in API
- added associated parameters data to excel export of spacecost in API
- added associated parameters data to excel exporter of metertrend in API
- added associated parameters data to excel exporter of meterenergy in API
- added associated parameters data to excel exporter of metersubmetersbalance in API
- added parameters data to excel exporter of metercost in API
- added associated parameters data to excel exporter of tenantstatistics in API
- added associated paramters data to excel exporter of tenantsaving in API
- added associated paramters data to excel exporter of tenantload in API
- added associated paramters data to excel exporter of tenantenergyitem in API
- added associated parameters data to excel exporter of tenantenergycategory in API
- added associated parameters data to excel exporter of tenantcost in API
- added associated parameters data to excel exporter of combinedequipmentstatistics in API
- added associated paramters data to combinedequipmentsaving in API
- added associated parameters data to combinedequipmentload in API
- added associated parameters data to combinedequipmentoutput in API
- added associated parameters data to combinedequipmentincome in API
- added associated parameters data to combinedequipmentenergyitem in API
- added associated parameters data to combinedequipmentenergycategory in API
- added associated parameters data to combinedequipmentcost in API
- added quickmode to HTTP request parameters of MeterTrend report in API
- added paramter data to excel exporter of EquipmentStatistics in API
- added parameter data to excel exporter of EquipmentSaving in API
- added paramter data to excel exporter of EquipmentOutput in API
- added parameter data to excel exporter of EquipmentLoad in API
- added paramters data to excel exporter of EquipmentEnergyItem in API
- added parameters data to excel exporter of EquipmentEnergyCategory in API

### Changed
- updated README
- updated excel exporter of metersubmetersbalance in API
- updated excel exporter of meterenergy in API
- updated excel exporter of metercost in API
- updated panel width and height of costcenter in Admin UI
- updated panel width and height of combinedequipment view in Admin UI
- updated panel width and height of equipment view in Admin UI
- changed query form column width from auto to xs={6} sm={3} in Web UI

### Fixed
- fixed issues in excel exporters of combinedequipment in API
- added parameters validator to statistics_hourly_data_by_period in API
- added code to validate parameters of averaging_hourly_data_by_period in API
- fixed issue in excel exporter of equipmentincome in API
- fixed unit issue in CombinedEquipmentCost report in API


### Removed
- deleted slim-scroll from and added maxheight to panel of views in Admin UI


## [v1.1.1] - 2021-03-31
### Added
- added associated equipment data to CombinedEquipmentCost report in API
- added associated equipment data to CombinedEquipmentStatistics report in API
- added associated equipment data to CombinedEquipmentSaving report in API
- added associated equipment data to CombinedEquipmentOutput report in API
- added associated equipment data to CombinedEquipmentLoad report in API
- added associated equipment data to CombinedEquipmentIncome report in API
- added associated equipment data to CombinedEquipmentEnergyItem report in API
- added associated equipment data to CombinedEquipmentEnergyCategory report in API
- added quickmode paramter to combinedequipmentefficiency report in API
- added associated equipment data to CombinedEquipmentStatistics in Web UI
- added associated equipment data to CombinedEquipmentLoad in Web UI
- added excel exporter of equipmentcost reporter in API
- added associated equipment data to CombinedEquipmentEnergyItem report in API
- added AssociatedEquipmentTable to CombinedEquipmentIncome Report in web UI
- added AssociatedEquipmentTable to CombinedEquipmentSaving Report in web UI
- added AssociatedEquipmentTable to CombinedEquipmentOutput Report in web UI
- added AssociatedEquipmentTable to CombinedEquipmentIncome Report in web UI
- added AssociatedEquipmentTable to CombinedEquipmentCost Report in web UI
- added AssociatedEquipmentTable to CombinedEquipmentEnergyCategory Report in web UI
- added AssociatedEquipmentTable to CombinedEquipmentEnergyItem Report in web UI
- added last_run_datetime and next_run_datetime to rule in API
- added Deutsch (German) login language list in admin UI

### Changed
- reduced font size of meterrealtime in Web UI
- moved category before fdd_code of rule in admin UI and API

### Fixed
- fixed omission mistakes in myems-cleaning
- fixed error for large number of parameters in combinedequipmentefficiency and equipmentefficiency in API
- fixed error of None Comparision in API
- fixed NoneType error in all Load reports API.

### Removed
- None.


## [v1.1.0] - 2021-03-18
### Added
- added excel exporter of equipmentefficiency report.
- added excel exporter of conbinedequipmentefficiency report in API.
- added 'optional' tips to meter,virtual meter and offline meter setting in admin UI.
- added Optional key to translation in admin UI.
- added cominbedequipmentefficiency report to api and web.
- added equipmentefficiency report api.

### Changed
- updated cost file controller in admin UI
- updated user login session expire time to 8 hours.
- changed web UI and API to set contact of space is optional.

### Fixed
- fixed http headers issues of offlinemeterfile, knowledgefile and costfile in admin UI
- changed float datatype to Decimal datatype for offline meter normalization.
- fixed issue of add space in web UI.
- added historical database close and disconnect at the end of reports.

### Removed
- None.

## [v1.0.8] - 2021-03-11
### Added
- added excel exporter of combinedequipmentstatistics report
- added translation for German
- added excel exporter of storesaving report
- added excel exporter of equipmentincome report
- added excel exporter of shopfloorsaving report
- added excel exporter of equipmentload report

### Changed
- Changed default reporting range in EnergyFlowDiagram.

### Fixed
- None.

### Removed
- None.

## [v1.0.7] - 2021-03-07
### Added
- added excel exporter of storeload report
- added excel exporter of spaceincome report
- added excel exporter of equipmentsaving report
- added excel exporter of combinedequipmentsaving report
- added excel exporter of combinedequipmentload report
- added excel exporter of spaceoutput report
- added excel exporter of combinedequipmentoutput
- added excel exporter of combinedequipmentcost report
- added excel exporter of shopfloorcost report
- added excel exporter of shopfloorload report
- added excel exporter of combinedequipmentenergycategory report
- added excel exporter of combinedequipmentitem report.
- added excel exporter of equipmentenergyitem report.
- added excel exporter of equipmentenergycategory report.
- added excel exporter of shopfloorenergyitem report.

### Changed
- None.

### Fixed
- fixed wrong HTTP headers in admin.
- fixed typo in combinedequipment controller in admin.
- fixed energy item undefined issue when edit virtual meter and offline meter.

### Removed
- removed 'required' property from equipment model in admin.

## [v1.0.6] - 2021-02-26
### Added
- added store statistics report excel exporter.
- added equipment tracking excel exporter.
- added store cost report excel exporter.
- added equipment statistics report excel exporter.
- added store energy item report excel exporter.
- added shopfloor statistics report excel exporter.
- merged myems-api.

### Changed
- modified database table tbl_energy_flow_diagrams_links

### Fixed
- fixed energy category names and units issue in EnergyItem reports.

### Removed
- None.

## [v1.0.5] - 2021-02-23
### Added
- None.

### Changed
- None.

### Fixed
- None.

### Removed
- None.

[Unreleased]: https://github.com/MyEMS/myems/compare/v1.1.6...HEAD
[v1.1.4]: https://github.com/MyEMS/myems/compare/v1.1.5...v1.1.6
[v1.1.4]: https://github.com/MyEMS/myems/compare/v1.1.4...v1.1.5
[v1.1.4]: https://github.com/MyEMS/myems/compare/v1.1.3...v1.1.4
[v1.1.3]: https://github.com/MyEMS/myems/compare/v1.1.2...v1.1.3
[v1.1.2]: https://github.com/MyEMS/myems/compare/v1.1.1...v1.1.2
[v1.1.1]: https://github.com/MyEMS/myems/compare/v1.1.0...v1.1.1
[v1.0.8]: https://github.com/MyEMS/myems/compare/v1.0.8...v1.1.0
[v1.0.8]: https://github.com/MyEMS/myems/compare/v1.0.7...v1.0.8
[v1.0.7]: https://github.com/MyEMS/myems/compare/v1.0.6...v1.0.7
[v1.0.6]: https://github.com/MyEMS/myems/compare/v1.0.5...v1.0.6
[v1.0.5]: https://github.com/MyEMS/myems/releases/tag/v1.0.5

