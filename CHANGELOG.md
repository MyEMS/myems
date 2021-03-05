# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]
### Added
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

[Unreleased]: https://github.com/MyEMS/myems/compare/v1.0.5...HEAD
[v1.0.6]: https://github.com/MyEMS/myems/compare/v1.0.5...v1.0.6
[v1.0.5]: https://github.com/MyEMS/myems/releases/tag/v1.0.5

