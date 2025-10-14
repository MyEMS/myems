"""
MyEMS Reports Module

This module contains report generation functionality for various MyEMS entities.
It provides REST API endpoints to generate comprehensive reports for different
types of energy management entities including:

- Equipment reports (batch, carbon, cost, efficiency, etc.)
- Meter reports (energy, cost, comparison, tracking, etc.)
- Space reports (carbon, cost, efficiency, statistics, etc.)
- Tenant reports (bill, carbon, cost, energy, etc.)
- Store reports (batch, carbon, cost, energy, etc.)
- Shop floor reports (batch, carbon, cost, energy, etc.)
- Combined equipment reports (batch, carbon, cost, efficiency, etc.)
- Offline meter reports (batch, carbon, cost, energy, etc.)
- Virtual meter reports (batch, carbon, cost, energy, etc.)
- Microgrid reports (dashboard, details, reporting, etc.)
- Photovoltaic power station reports (dashboard, details, reporting, etc.)
- Energy storage power station reports (dashboard, details, reporting, etc.)
- Advanced reports (dashboard, energy flow diagram, etc.)

Each report follows a consistent pattern:
1. Validate input parameters
2. Query relevant data from database
3. Process and calculate metrics
4. Generate Excel export if requested
5. Return JSON response

The module uses Falcon framework for REST API endpoints and includes support for:
- Multi-language translations
- Excel export functionality
- Real-time data processing
- Historical data analysis
- Base period comparisons
- Parameter validation and error handling
"""
