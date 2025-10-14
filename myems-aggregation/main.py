"""
MyEMS Aggregation Service - Main Module

This module is the main entry point for the MyEMS aggregation service.
It initializes logging and starts multiple parallel processes to handle different types
of data aggregation and calculation tasks.

The service runs these processes in parallel to efficiently aggregate energy data:

1. **Combined Equipment Processing**: Energy consumption, billing, and carbon emissions for combined equipment
2. **Equipment Processing**: Energy consumption, billing, and carbon emissions for individual equipment
3. **Meter Processing**: Billing and carbon emissions calculations for physical meters
4. **Offline Meter Processing**: Billing and carbon emissions for offline meters
5. **Virtual Meter Processing**: Billing and carbon emissions for virtual meters
6. **Space Processing**: Energy consumption, billing, and carbon emissions for spaces
7. **Store Processing**: Energy consumption, billing, and carbon emissions for stores
8. **Tenant Processing**: Energy consumption, billing, and carbon emissions for tenants
9. **Shopfloor Processing**: Energy consumption, billing, and carbon emissions for shopfloors

Each process runs independently to ensure robust data aggregation and system reliability.
"""

import logging
from logging.handlers import RotatingFileHandler
from multiprocessing import Process

import combined_equipment_billing_input_category
import combined_equipment_billing_input_item
import combined_equipment_billing_output_category
import combined_equipment_carbon_input_category
import combined_equipment_energy_input_category
import combined_equipment_energy_input_item
import combined_equipment_energy_output_category
import equipment_billing_input_category
import equipment_billing_input_item
import equipment_billing_output_category
import equipment_carbon_input_category
import equipment_energy_input_category
import equipment_energy_input_item
import equipment_energy_output_category
import meter_billing
import meter_carbon
import offline_meter_billing
import offline_meter_carbon
import shopfloor_billing_input_category
import shopfloor_billing_input_item
import shopfloor_carbon_input_category
import shopfloor_energy_input_category
import shopfloor_energy_input_item
import space_billing_input_category
import space_billing_input_item
import space_billing_output_category
import space_carbon_input_category
import space_energy_input_category
import space_energy_input_item
import space_energy_output_category
import store_billing_input_category
import store_billing_input_item
import store_carbon_input_category
import store_energy_input_category
import store_energy_input_item
import tenant_billing_input_category
import tenant_billing_input_item
import tenant_carbon_input_category
import tenant_energy_input_category
import tenant_energy_input_item
import virtual_meter_billing
import virtual_meter_carbon


def main():
    """
    Main function to initialize the MyEMS aggregation service.

    Sets up logging configuration and starts multiple parallel processes for different
    types of data aggregation and calculation tasks including energy consumption,
    billing calculations, and carbon emissions tracking.
    """
    # Create logger for the aggregation service
    logger = logging.getLogger('myems-aggregation')

    # Set logging level to ERROR to capture only error messages and above
    # This specifies the lowest-severity log message a logger will handle,
    # where debug is the lowest built-in severity level and critical is the highest built-in severity.
    # For example, if the severity level is INFO, the logger will handle only INFO, WARNING, ERROR, and CRITICAL
    # messages and will ignore DEBUG messages.
    logger.setLevel(logging.ERROR)

    # Create rotating file handler which logs messages to a file
    # maxBytes=1024*1024 means 1MB, backupCount=1 means keep 1 backup file
    fh = RotatingFileHandler('myems-aggregation.log', maxBytes=1024*1024, backupCount=1)

    # Create formatter for log messages and add it to the file handler
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    fh.setFormatter(formatter)

    # Add the file handler to logger
    logger.addHandler(fh)

    # Add console handler to send logging output to sys.stderr
    logger.addHandler(logging.StreamHandler())

    ####################################################################################################################
    # Start Combined Equipment Processing Processes
    ####################################################################################################################
    # Combined equipment billing input by energy categories
    Process(target=combined_equipment_billing_input_category.main, args=(logger,)).start()
    # Combined equipment billing input by energy items
    Process(target=combined_equipment_billing_input_item.main, args=(logger,)).start()
    # Combined equipment billing output by energy categories
    Process(target=combined_equipment_billing_output_category.main, args=(logger,)).start()
    # Combined equipment carbon dioxide emissions by energy categories
    Process(target=combined_equipment_carbon_input_category.main, args=(logger,)).start()
    # Combined equipment energy input by energy categories
    Process(target=combined_equipment_energy_input_category.main, args=(logger,)).start()
    # Combined equipment energy input by energy items
    Process(target=combined_equipment_energy_input_item.main, args=(logger,)).start()
    # Combined equipment energy output by energy categories
    Process(target=combined_equipment_energy_output_category.main, args=(logger,)).start()

    ####################################################################################################################
    # Start Equipment Processing Processes
    ####################################################################################################################
    # Equipment billing input by energy categories
    Process(target=equipment_billing_input_category.main, args=(logger,)).start()
    # Equipment billing input by energy items
    Process(target=equipment_billing_input_item.main, args=(logger,)).start()
    # Equipment billing output by energy categories
    Process(target=equipment_billing_output_category.main, args=(logger,)).start()
    # Equipment carbon dioxide emissions by energy categories
    Process(target=equipment_carbon_input_category.main, args=(logger,)).start()
    # Equipment energy input by energy categories
    Process(target=equipment_energy_input_category.main, args=(logger,)).start()
    # Equipment energy input by energy items
    Process(target=equipment_energy_input_item.main, args=(logger,)).start()
    # Equipment energy output by energy categories
    Process(target=equipment_energy_output_category.main, args=(logger,)).start()

    ####################################################################################################################
    # Start Meter Processing Processes
    ####################################################################################################################
    # Meter carbon dioxide emissions calculation
    Process(target=meter_carbon.main, args=(logger,)).start()
    # Meter billing calculation
    Process(target=meter_billing.main, args=(logger,)).start()

    ####################################################################################################################
    # Start Offline Meter Processing Processes
    ####################################################################################################################
    # Offline meter carbon dioxide emissions calculation
    Process(target=offline_meter_carbon.main, args=(logger,)).start()
    # Offline meter billing calculation
    Process(target=offline_meter_billing.main, args=(logger,)).start()

    ####################################################################################################################
    # Start Shopfloor Processing Processes
    ####################################################################################################################
    # Shopfloor billing input by energy categories
    Process(target=shopfloor_billing_input_category.main, args=(logger,)).start()
    # Shopfloor billing input by energy items
    Process(target=shopfloor_billing_input_item.main, args=(logger,)).start()
    # Shopfloor carbon dioxide emissions by energy categories
    Process(target=shopfloor_carbon_input_category.main, args=(logger,)).start()
    # Shopfloor energy input by energy categories
    Process(target=shopfloor_energy_input_category.main, args=(logger,)).start()
    # Shopfloor energy input by energy items
    Process(target=shopfloor_energy_input_item.main, args=(logger,)).start()

    ####################################################################################################################
    # Start Space Processing Processes
    ####################################################################################################################
    # Space billing input by energy categories
    Process(target=space_billing_input_category.main, args=(logger,)).start()
    # Space billing input by energy items
    Process(target=space_billing_input_item.main, args=(logger,)).start()
    # Space billing output by energy categories
    Process(target=space_billing_output_category.main, args=(logger,)).start()
    # Space carbon dioxide emissions by energy categories
    Process(target=space_carbon_input_category.main, args=(logger,)).start()
    # Space energy input by energy categories
    Process(target=space_energy_input_category.main, args=(logger,)).start()
    # Space energy input by energy items
    Process(target=space_energy_input_item.main, args=(logger,)).start()
    # Space energy output by energy categories
    Process(target=space_energy_output_category.main, args=(logger,)).start()

    ####################################################################################################################
    # Start Store Processing Processes
    ####################################################################################################################
    # Store billing input by energy categories
    Process(target=store_billing_input_category.main, args=(logger,)).start()
    # Store billing input by energy items
    Process(target=store_billing_input_item.main, args=(logger,)).start()
    # Store carbon dioxide emissions by energy categories
    Process(target=store_carbon_input_category.main, args=(logger,)).start()
    # Store energy input by energy categories
    Process(target=store_energy_input_category.main, args=(logger,)).start()
    # Store energy input by energy items
    Process(target=store_energy_input_item.main, args=(logger,)).start()

    ####################################################################################################################
    # Start Tenant Processing Processes
    ####################################################################################################################
    # Tenant billing input by energy categories
    Process(target=tenant_billing_input_category.main, args=(logger,)).start()
    # Tenant billing input by energy items
    Process(target=tenant_billing_input_item.main, args=(logger,)).start()
    # Tenant carbon dioxide emissions by energy categories
    Process(target=tenant_carbon_input_category.main, args=(logger,)).start()
    # Tenant energy input by energy categories
    Process(target=tenant_energy_input_category.main, args=(logger,)).start()
    # Tenant energy input by energy items
    Process(target=tenant_energy_input_item.main, args=(logger,)).start()

    ####################################################################################################################
    # Start Virtual Meter Processing Processes
    ####################################################################################################################
    # Virtual meter carbon dioxide emissions calculation
    Process(target=virtual_meter_carbon.main, args=(logger,)).start()
    # Virtual meter billing calculation (cost or income)
    Process(target=virtual_meter_billing.main, args=(logger,)).start()


if __name__ == '__main__':
    main()


