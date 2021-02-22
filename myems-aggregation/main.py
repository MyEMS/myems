import logging
from logging.handlers import RotatingFileHandler
from multiprocessing import Process


import combined_equipment_energy_input_category
import combined_equipment_energy_input_item
import combined_equipment_energy_output_category

import combined_equipment_billing_input_category
import combined_equipment_billing_input_item
import combined_equipment_billing_output_category

import equipment_energy_input_category
import equipment_energy_input_item
import equipment_energy_output_category

import equipment_billing_input_category
import equipment_billing_input_item
import equipment_billing_output_category

import meter_billing

import shopfloor_billing_input_category
import shopfloor_billing_input_item

import shopfloor_energy_input_category
import shopfloor_energy_input_item

import space_billing_input_category
import space_billing_input_item
import space_billing_output_category

import space_energy_input_category
import space_energy_input_item
import space_energy_output_category

import store_billing_input_category
import store_billing_input_item

import store_energy_input_category
import store_energy_input_item

import tenant_billing_input_category
import tenant_billing_input_item

import tenant_energy_input_category
import tenant_energy_input_item


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

    # combined equipment energy input by energy categories
    Process(target=combined_equipment_energy_input_category.main, args=(logger,)).start()
    # combined equipment energy input by energy items
    Process(target=combined_equipment_energy_input_item.main, args=(logger,)).start()
    # combined equipment energy output by energy categories
    Process(target=combined_equipment_energy_output_category.main, args=(logger,)).start()

    # combined equipment billing input by energy categories
    Process(target=combined_equipment_billing_input_category.main, args=(logger,)).start()
    # combined equipment billing input by energy items
    Process(target=combined_equipment_billing_input_item.main, args=(logger,)).start()
    # combined equipment billing output by energy categories
    Process(target=combined_equipment_billing_output_category.main, args=(logger,)).start()

    # equipment billing input by energy categories
    Process(target=equipment_billing_input_category.main, args=(logger,)).start()
    # equipment billing input by energy items
    Process(target=equipment_billing_input_item.main, args=(logger,)).start()
    # equipment billing output by energy categories
    Process(target=equipment_billing_output_category.main, args=(logger,)).start()

    # equipment energy input by energy categories
    Process(target=equipment_energy_input_category.main, args=(logger,)).start()
    # equipment energy input by energy items
    Process(target=equipment_energy_input_item.main, args=(logger,)).start()
    # equipment energy output by energy categories
    Process(target=equipment_energy_output_category.main, args=(logger,)).start()

    # meter billing
    Process(target=meter_billing.main, args=(logger,)).start()

    # shopfloor billing input by energy categories
    Process(target=shopfloor_billing_input_category.main, args=(logger,)).start()
    # shopfloor billing input by energy items
    Process(target=shopfloor_billing_input_item.main, args=(logger,)).start()

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

    # store energy input by energy categories
    Process(target=store_energy_input_category.main, args=(logger,)).start()
    # store energy input by energy items
    Process(target=store_energy_input_item.main, args=(logger,)).start()

    # tenant billing input by energy categories
    Process(target=tenant_billing_input_category.main, args=(logger,)).start()
    # tenant billing input by energy items
    Process(target=tenant_billing_input_item.main, args=(logger,)).start()

    # tenant energy input by energy categories
    Process(target=tenant_energy_input_category.main, args=(logger,)).start()
    # tenant energy input by energy items
    Process(target=tenant_energy_input_item.main, args=(logger,)).start()


if __name__ == '__main__':
    main()


