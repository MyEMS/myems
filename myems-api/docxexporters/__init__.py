"""
MyEMS DOCX Exporters Module

This module contains DOCX export functionality for various MyEMS reports.
It provides functions to generate Word document files with formatted data, tables, and visualizations
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
2. Generate DOCX file with proper formatting
3. Encode file to Base64 for transmission

The module uses python-docx for DOCX file generation and includes support for:
- Multi-language translations
- Tables with styled formatting
- Images and charts (via matplotlib)
- Proper formatting and styling
- Data validation and error handling
"""
