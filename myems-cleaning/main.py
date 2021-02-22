import logging
from logging.handlers import RotatingFileHandler
from multiprocessing import Process
import clean_analog_value
import clean_digital_value
import clean_energy_value


def main():
    """main"""
    # create logger
    logger = logging.getLogger('myems-cleaning')
    # specifies the lowest-severity log message a logger will handle,
    # where debug is the lowest built-in severity level and critical is the highest built-in severity.
    # For example, if the severity level is INFO, the logger will handle only INFO, WARNING, ERROR, and CRITICAL
    # messages and will ignore DEBUG messages.
    logger.setLevel(logging.ERROR)
    # create file handler which logs messages
    fh = RotatingFileHandler('myems-cleaning.log', maxBytes=1024*1024, backupCount=1)
    # create formatter and add it to the handlers
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    fh.setFormatter(formatter)
    # add the handlers to logger
    logger.addHandler(fh)

    # clean analog values
    Process(target=clean_analog_value.process, args=(logger,)).start()
    # clean digital values
    Process(target=clean_digital_value.process, args=(logger,)).start()
    # clean energy values
    Process(target=clean_energy_value.process, args=(logger,)).start()


if __name__ == '__main__':
    main()


