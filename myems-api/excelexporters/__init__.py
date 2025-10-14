"""
MyEMS Excel Exporters Module

This module contains Excel export functionality for various MyEMS reports.
It provides functions to generate Excel files with formatted data, charts, and visualizations
for different types of energy management reports including:

- Equipment reports (batch, carbon, cost, efficiency, etc.)
- Meter reports (energy, cost, comparison, tracking, etc.)
- Space reports (carbon, cost, efficiency, statistics, etc.)
- Tenant reports (bill, carbon, cost, energy, etc.)
- Store reports (batch, carbon, cost, energy, etc.)
- Shop floor reports (batch, carbon, cost, energy, etc.)
- Combined equipment reports (batch, carbon, cost, efficiency, etc.)
- Offline meter reports (batch, carbon, cost, energy, etc.)
- Virtual meter reports (batch, carbon, cost, energy, etc.)
- Special reports (energy flow diagram, microgrid, photovoltaic, energy storage, etc.)

Each exporter follows a consistent pattern:
1. Validate input data
2. Generate Excel file with proper formatting
3. Encode file to Base64 for transmission

The module uses openpyxl for Excel file generation and includes support for:
- Multi-language translations
- Charts and visualizations
- Proper formatting and styling
- Data validation and error handling
"""
