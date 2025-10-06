"""
MyEMS Cleaning Service - Main Module

This module is the main entry point for the MyEMS cleaning service.
It initializes logging and starts three separate processes to clean different types of data:
- Analog values cleaning
- Digital values cleaning
- Energy values cleaning

The service runs these processes in parallel to efficiently clean historical data
and maintain database performance.
"""

import logging
from logging.handlers import RotatingFileHandler
from multiprocessing import Process

import clean_analog_value
import clean_digital_value
import clean_energy_value


def main():
    """
    Main function to initialize the MyEMS cleaning service.

    Sets up logging configuration and starts three parallel processes for cleaning
    different types of historical data values.
    """
    # Create logger for the cleaning service
    logger = logging.getLogger('myems-cleaning')

    # Set logging level to ERROR to capture only error messages and above
    # This specifies the lowest-severity log message a logger will handle,
    # where debug is the lowest built-in severity level and critical is the highest built-in severity.
    # For example, if the severity level is INFO, the logger will handle only INFO, WARNING, ERROR, and CRITICAL
    # messages and will ignore DEBUG messages.
    logger.setLevel(logging.ERROR)

    # Create rotating file handler which logs messages to a file
    # maxBytes=1024*1024 means 1MB, backupCount=1 means keep 1 backup file
    fh = RotatingFileHandler('myems-cleaning.log', maxBytes=1024*1024, backupCount=1)

    # Create formatter for log messages and add it to the file handler
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    fh.setFormatter(formatter)

    # Add the file handler to logger
    logger.addHandler(fh)

    # Add console handler to send logging output to sys.stderr
    logger.addHandler(logging.StreamHandler())

    # Start process to clean analog values (sensor readings like temperature, pressure, etc.)
    Process(target=clean_analog_value.process, args=(logger,)).start()

    # Start process to clean digital values (binary states like on/off, open/closed, etc.)
    Process(target=clean_digital_value.process, args=(logger,)).start()

    # Start process to clean energy values (power consumption, energy usage data)
    Process(target=clean_energy_value.process, args=(logger,)).start()


if __name__ == '__main__':
    main()


