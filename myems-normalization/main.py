"""
MyEMS Normalization Service - Main Module

This module is the main entry point for the MyEMS normalization service.
It initializes logging and starts five separate processes to handle different types
of data normalization and processing tasks.

The service runs these processes in parallel to efficiently process energy data:

1. **Meter Normalization**: Processes energy consumption data from physical meters
2. **Offline Meter Processing**: Handles uploaded Excel files with offline meter data
3. **Virtual Meter Calculation**: Computes virtual meter values using mathematical expressions
4. **Virtual Point Calculation**: Processes virtual points with algebraic expressions
5. **Data Repair**: Repairs historical energy data from uploaded Excel files

Each process runs independently to ensure robust data processing and system reliability.
"""

import logging
from logging.handlers import RotatingFileHandler
from multiprocessing import Process
import datarepair
import meter
import offlinemeter
import virtualmeter
import virtualpoint


def main():
    """
    Main function to initialize the MyEMS normalization service.

    Sets up logging configuration and starts five parallel processes for different
    types of data normalization and processing tasks.
    """
    # Create logger for the normalization service
    logger = logging.getLogger('myems-normalization')

    # Set logging level to ERROR to capture only error messages and above
    # This specifies the lowest-severity log message a logger will handle,
    # where debug is the lowest built-in severity level and critical is the highest built-in severity.
    # For example, if the severity level is INFO, the logger will handle only INFO, WARNING, ERROR, and CRITICAL
    # messages and will ignore DEBUG messages.
    logger.setLevel(logging.ERROR)

    # Create rotating file handler which logs messages to a file
    # maxBytes=1024*1024 means 1MB, backupCount=1 means keep 1 backup file
    fh = RotatingFileHandler('myems-normalization.log', maxBytes=1024*1024, backupCount=1)

    # Create formatter for log messages and add it to the file handler
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    fh.setFormatter(formatter)

    # Add the file handler to logger
    logger.addHandler(fh)

    # Add console handler to send logging output to sys.stderr
    logger.addHandler(logging.StreamHandler())

    # Start process to calculate energy consumption in hourly periods from physical meters
    Process(target=meter.calculate_hourly, args=(logger,)).start()

    # Start process to process offline meter data from uploaded Excel files
    Process(target=offlinemeter.calculate_hourly, args=(logger,)).start()

    # Start process to calculate virtual meter values using mathematical expressions
    Process(target=virtualmeter.calculate_hourly, args=(logger,)).start()

    # Start process to calculate virtual point values using algebraic expressions
    Process(target=virtualpoint.calculate, args=(logger,)).start()

    # Start process to repair historical energy data from uploaded Excel files
    Process(target=datarepair.do, args=(logger,)).start()


if __name__ == '__main__':
    main()


