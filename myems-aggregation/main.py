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
import energy_storage_container_billing_charge
import energy_storage_container_energy_charge
import energy_storage_container_carbon_charge
import energy_storage_container_billing_discharge
import energy_storage_container_energy_discharge
import energy_storage_container_carbon_discharge
import equipment_billing_input_category
import equipment_billing_input_item
import equipment_billing_output_category
import equipment_carbon_input_category
import equipment_energy_input_category
import equipment_energy_input_item
import equipment_energy_output_category
import meter_billing
import meter_carbon
import microgrid_billing_charge
import microgrid_energy_charge
import microgrid_carbon_charge
import microgrid_billing_discharge
import microgrid_energy_discharge
import microgrid_carbon_discharge
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
    """main"""
    # create logger
    logger = logging.getLogger('myems-aggregation')
    # specifies the lowest-severity log message a logger will handle,
    # where debug is the lowest built-in severity level and critical is the highest built-in severity.
    # For example, if the severity level is INFO, the logger will handle only INFO, WARNING, ERROR, and CRITICAL
    # messages and will ignore DEBUG messages.
    logger.setLevel(logging.ERROR)
    # create file handler which logs messages
    fh = RotatingFileHandler('myems-aggregation.log', maxBytes=1024*1024, backupCount=1)
    # create formatter and add it to the handlers
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    fh.setFormatter(formatter)
    # add the handlers to logger
    logger.addHandler(fh)
    # send logging output to sys.stderr
    logger.addHandler(logging.StreamHandler())

    # combined equipment billing input by energy categories
    Process(target=combined_equipment_billing_input_category.main, args=(logger,)).start()
    # combined equipment billing input by energy items
    Process(target=combined_equipment_billing_input_item.main, args=(logger,)).start()
    # combined equipment billing output by energy categories
    Process(target=combined_equipment_billing_output_category.main, args=(logger,)).start()
    # combined equipment carbon dioxide emissions by energy categories
    Process(target=combined_equipment_carbon_input_category.main, args=(logger,)).start()
    # combined equipment energy input by energy categories
    Process(target=combined_equipment_energy_input_category.main, args=(logger,)).start()
    # combined equipment energy input by energy items
    Process(target=combined_equipment_energy_input_item.main, args=(logger,)).start()
    # combined equipment energy output by energy categories
    Process(target=combined_equipment_energy_output_category.main, args=(logger,)).start()

    # energy storage container energy charge
    Process(target=energy_storage_container_energy_charge.main, args=(logger,)).start()
    # energy storage container energy discharge
    Process(target=energy_storage_container_energy_discharge.main, args=(logger,)).start()
    # energy storage container billing charge
    Process(target=energy_storage_container_billing_charge.main, args=(logger,)).start()
    # energy storage container billing discharge
    Process(target=energy_storage_container_billing_discharge.main, args=(logger,)).start()
    # energy storage container carbon charge
    Process(target=energy_storage_container_carbon_charge.main, args=(logger,)).start()
    # energy storage container carbon discharge
    Process(target=energy_storage_container_carbon_discharge.main, args=(logger,)).start()

    # equipment billing input by energy categories
    Process(target=equipment_billing_input_category.main, args=(logger,)).start()
    # equipment billing input by energy items
    Process(target=equipment_billing_input_item.main, args=(logger,)).start()
    # equipment billing output by energy categories
    Process(target=equipment_billing_output_category.main, args=(logger,)).start()
    # equipment carbon dioxide emissions by energy categories
    Process(target=equipment_carbon_input_category.main, args=(logger,)).start()
    # equipment energy input by energy categories
    Process(target=equipment_energy_input_category.main, args=(logger,)).start()
    # equipment energy input by energy items
    Process(target=equipment_energy_input_item.main, args=(logger,)).start()
    # equipment energy output by energy categories
    Process(target=equipment_energy_output_category.main, args=(logger,)).start()

    # meter carbon dioxide emissions
    Process(target=meter_carbon.main, args=(logger,)).start()
    # meter billing
    Process(target=meter_billing.main, args=(logger,)).start()

    # microgrid energy charge
    Process(target=microgrid_energy_charge.main, args=(logger,)).start()
    # microgrid energy discharge
    Process(target=microgrid_energy_discharge.main, args=(logger,)).start()
    # microgrid billing charge
    Process(target=microgrid_billing_charge.main, args=(logger,)).start()
    # microgrid billing discharge
    Process(target=microgrid_billing_discharge.main, args=(logger,)).start()
    # microgrid carbon charge
    Process(target=microgrid_carbon_charge.main, args=(logger,)).start()
    # microgrid carbon discharge
    Process(target=microgrid_carbon_discharge.main, args=(logger,)).start()

    # offline meter carbon dioxide emissions
    Process(target=offline_meter_carbon.main, args=(logger,)).start()
    # offline meter billing
    Process(target=offline_meter_billing.main, args=(logger,)).start()

    # shopfloor billing input by energy categories
    Process(target=shopfloor_billing_input_category.main, args=(logger,)).start()
    # shopfloor billing input by energy items
    Process(target=shopfloor_billing_input_item.main, args=(logger,)).start()
    # shopfloor carbon dioxide emissions by energy categories
    Process(target=shopfloor_carbon_input_category.main, args=(logger,)).start()
    # shopfloor energy input by energy categories
    Process(target=shopfloor_energy_input_category.main, args=(logger,)).start()
    # shopfloor energy input by energy items
    Process(target=shopfloor_energy_input_item.main, args=(logger,)).start()

    # space billing input by energy categories
    Process(target=space_billing_input_category.main, args=(logger,)).start()
    # space billing input by energy items
    Process(target=space_billing_input_item.main, args=(logger,)).start()
    # space billing output by energy categories
    Process(target=space_billing_output_category.main, args=(logger,)).start()
    # space carbon dioxide emissions by energy categories
    Process(target=space_carbon_input_category.main, args=(logger,)).start()
    # space energy input by energy categories
    Process(target=space_energy_input_category.main, args=(logger,)).start()
    # space energy input by energy items
    Process(target=space_energy_input_item.main, args=(logger,)).start()
    # space energy output by energy categories
    Process(target=space_energy_output_category.main, args=(logger,)).start()

    # store billing input by energy categories
    Process(target=store_billing_input_category.main, args=(logger,)).start()
    # store billing input by energy items
    Process(target=store_billing_input_item.main, args=(logger,)).start()
    # store carbon dioxide emissions by energy categories
    Process(target=store_carbon_input_category.main, args=(logger,)).start()
    # store energy input by energy categories
    Process(target=store_energy_input_category.main, args=(logger,)).start()
    # store energy input by energy items
    Process(target=store_energy_input_item.main, args=(logger,)).start()

    # tenant billing input by energy categories
    Process(target=tenant_billing_input_category.main, args=(logger,)).start()
    # tenant billing input by energy items
    Process(target=tenant_billing_input_item.main, args=(logger,)).start()
    # tenant carbon dioxide emissions by energy categories
    Process(target=tenant_carbon_input_category.main, args=(logger,)).start()
    # tenant energy input by energy categories
    Process(target=tenant_energy_input_category.main, args=(logger,)).start()
    # tenant energy input by energy items
    Process(target=tenant_energy_input_item.main, args=(logger,)).start()

    # virtual meter carbon dioxide emission
    Process(target=virtual_meter_carbon.main, args=(logger,)).start()
    # virtual meter billing (cost or income)
    Process(target=virtual_meter_billing.main, args=(logger,)).start()


if __name__ == '__main__':
    main()


