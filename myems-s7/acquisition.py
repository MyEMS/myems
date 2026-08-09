import json
import struct
import telnetlib
import time
from datetime import datetime
from decimal import Decimal
import mysql.connector
import snap7
import config


########################################################################################################################
# Procedures:
# Step 1: Telnet the host
# Step 2: Get point list
# Step 3: Read values from the S7 devices
# Step 4: Bulk insert point values and update latest values in historical database
########################################################################################################################


def process(logger, data_source_id, host, rack, slot, port):
    # todo: update data source last seen datetime
    while True:
        # the outermost while loop

        ################################################################################################################
        # Step 1: Telnet the host
        ################################################################################################################
        try:
            telnetlib.Telnet(host, port, 10)
            print("Succeeded to telnet %s:%s in acquisition process ", host, port)
        except Exception as e:
            logger.error("Failed to telnet %s:%s in acquisition process: %s  ", host, port, str(e))
            # Sleep and then continue the outside while loop
            time.sleep(300)
            continue

        ################################################################################################################
        # Step 2: Get point list
        ################################################################################################################
        cnx_system_db = None
        cursor_system_db = None
        try:
            cnx_system_db = mysql.connector.connect(**config.myems_system_db)
            cursor_system_db = cnx_system_db.cursor()
        except Exception as e:
            logger.error("Error in step 2.1 of acquisition process: " + str(e))
            if cursor_system_db:
                cursor_system_db.close()
            if cnx_system_db:
                cnx_system_db.close()
            # Sleep and then continue the outermost while loop
            time.sleep(60)
            continue

        try:
            query = (" SELECT id, name, object_type, is_trend, ratio, address "
                     " FROM tbl_points "
                     " WHERE data_source_id = %s AND is_virtual = 0 "
                     " ORDER BY id ")
            cursor_system_db.execute(query, (data_source_id,))
            rows_point = cursor_system_db.fetchall()
        except Exception as e:
            logger.error("Error in step 2.2 of acquisition process: " + str(e))
            # Sleep and then continue to the outside while loop
            time.sleep(60)
            continue
        finally:
            if cursor_system_db:
                cursor_system_db.close()
            if cnx_system_db:
                cnx_system_db.close()

        if rows_point is None or len(rows_point) == 0:
            # there is no points for this data source
            logger.error("Point Not Found with Data Source (ID = %s) ", data_source_id)
            # Sleep and then continue the outside while loop
            time.sleep(60)
            continue

        point_list = list()
        for row_point in rows_point:
            point_list.append({"id": row_point[0],
                               "name": row_point[1],
                               "object_type": row_point[2],
                               "is_trend": row_point[3],
                               "ratio": row_point[4],
                               "address": row_point[5]})

        ################################################################################################################
        # Step 3: Read values from the S7 device
        ################################################################################################################
        cnx_historical_db = None
        cursor_historical_db = None
        try:
            cnx_historical_db = mysql.connector.connect(**config.myems_historical_db)
            cursor_historical_db = cnx_historical_db.cursor()
        except Exception as e:
            logger.error("Error in step 3.1 of acquisition process " + str(e))
            if cursor_historical_db:
                cursor_historical_db.close()
            if cnx_historical_db:
                cnx_historical_db.close()
            # Sleep and then continue the outermost while loop
            time.sleep(60)
            continue

        # connect to the S7 device
        s7_client = None
        try:
            s7_client = snap7.client.Client()
            s7_client.connect(host, rack, slot, port)
        except Exception as e:
            logger.error("S7 Client Connection error in step 3.2 of acquisition process: " + str(e))
            if s7_client.get_connected():
                s7_client.disconnect()
                s7_client.destroy()
            # close the database connection as well
            if cursor_historical_db:
                cursor_historical_db.close()
            if cnx_historical_db:
                cnx_historical_db.close()

            # sleep and then continue the outermost while loop
            time.sleep(60)
            continue

        print("Ready to connect to %s:%s ", host, port)

        while True:
            # inner while loop to periodically read all points
            energy_value_list = list()
            analog_value_list = list()
            digital_value_list = list()

            # check whether we are still connected with the data source

            if not s7_client.get_connected():
                # destroy the snap7 client
                s7_client.destroy()
                # close the connection to database
                if cursor_historical_db:
                    cursor_historical_db.close()
                if cnx_historical_db:
                    cnx_historical_db.close()

                # break the inner while loop to reconnect the s7 device
                time.sleep(60)
                break

            # indicates if there is an read area error
            is_read_area_error = False

            for point in point_list:
                address = json.loads(point['address'])
                if 'area' not in address.keys() \
                    or 'db_number' not in address.keys() \
                    or 'start' not in address.keys() \
                    or 'size' not in address.keys() \
                    or 'type' not in address.keys() \
                    or 'byte_index' not in address.keys() \
                    or 'bool_index' not in address.keys() \
                    or address['area'] not in ('PE', 'PA', 'MK', 'DB', 'CT', 'TM') \
                    or address['db_number'] < 0 \
                    or address['start'] < 0 \
                    or address['size'] not in (1, 2, 3, 4) \
                    or address['byte_index'] < 0 \
                    or address['bool_index'] < 0 \
                        or address['type'] not in ('real', 'bool', 'int', 'byte'):

                    logger.error('Data Source(ID=%s), Point(ID=%s) Invalid address data.',
                                 data_source_id, point['id'])
                    # invalid point is found, and go on the foreach point loop to process next point
                    continue

                # read area value
                area = None
                value = None
                try:
                    if address['area'] == 'PE':
                        area = snap7.snap7types.S7AreaPE
                    elif address['area'] == 'PA':
                        area = snap7.snap7types.S7AreaPA
                    elif address['area'] == 'MK':
                        area = snap7.snap7types.S7AreaMK
                    elif address['area'] == 'DB':
                        area = snap7.snap7types.S7AreaDB
                    elif address['area'] == 'CT':
                        area = snap7.snap7types.S7AreaCT
                    elif address['area'] == 'TM':
                        area = snap7.snap7types.S7AreaTM

                    reading = s7_client.read_area(area,
                                                  address['db_number'],
                                                  address['start'],
                                                  address['size'])
                    # todo: verify reading result is valid
                    if address['type'] == 'bool':
                        value = snap7.util.get_bool(reading, address['byte_index'], address['bool_index'])
                    elif address['type'] == 'real':
                        value = snap7.util.get_real(reading, address['byte_index'])
                    elif address['type'] == 'int':
                        value = snap7.util.get_int(reading, address['byte_index'])
                    elif address['type'] == 'byte':
                        # There is no get_byte or get_short in the snap7.util library
                        reading = reading[address['byte_index']:address['byte_index']+1]
                        reading[0] = reading[0] & 0xff
                        packed = struct.pack('B', *reading)
                        value = struct.unpack('>B', packed)[0]
                except Exception as e:
                    logger.error(str(e) + " at " +
                                 " host:" + host + " port:" + str(port) +
                                 " area:" + str(address['area']) +
                                 " db_number:" + str(address['db_number']) +
                                 " start:" + str(address['start']) +
                                 " size:" + str(address['size']))

                    # the following exception may occur after the device being rebooted
                    # ISO : An error occurred during send TCP : Other Socket error (32)
                    is_read_area_error = True

                    # break the foreach point loop
                    break

                if point['object_type'] == 'ANALOG_VALUE':
                    analog_value_list.append({'data_source_id': data_source_id,
                                              'point_id': point['id'],
                                              'is_trend': point['is_trend'],
                                              'value': Decimal(value) * point['ratio']})
                elif point['object_type'] == 'ENERGY_VALUE':
                    energy_value_list.append({'data_source_id': data_source_id,
                                              'point_id': point['id'],
                                              'is_trend': point['is_trend'],
                                              'value': Decimal(value) * point['ratio']})
                elif point['object_type'] == 'DIGITAL_VALUE':
                    digital_value_list.append({'data_source_id': data_source_id,
                                               'point_id': point['id'],
                                               'is_trend': point['is_trend'],
                                               'value': int(value) * int(point['ratio'])})
            # end of foreach point loop

            ############################################################################################################
            # Step 4: Bulk insert point values and update latest values in historical database
            ############################################################################################################
            # check the connection to the Historical Database
            if not cnx_historical_db.is_connected():
                try:
                    cnx_historical_db = mysql.connector.connect(**config.myems_historical_db)
                    cursor_historical_db = cnx_historical_db.cursor()
                except Exception as e:
                    logger.error("Error in step 4.1 of acquisition process: " + str(e))
                    if cursor_historical_db:
                        cursor_historical_db.close()
                    if cnx_historical_db:
                        cnx_historical_db.close()
                    # sleep some seconds
                    time.sleep(60)
                    continue

            current_datetime_utc = datetime.utcnow()
            # bulk insert values into historical database within a period
            # update latest values in the meanwhile
            if len(analog_value_list) > 0:
                add_values = (" INSERT INTO tbl_analog_value (point_id, utc_date_time, actual_value) "
                              " VALUES  ")
                trend_value_count = 0

                for point_value in analog_value_list:
                    if point_value['is_trend']:
                        add_values += " (" + str(point_value['point_id']) + ","
                        add_values += "'" + current_datetime_utc.isoformat() + "',"
                        add_values += str(point_value['value']) + "), "
                        trend_value_count += 1

                if trend_value_count > 0:
                    try:
                        # trim ", " at the end of string and then execute
                        cursor_historical_db.execute(add_values[:-2])
                        cnx_historical_db.commit()
                    except Exception as e:
                        logger.error("Error in step 4.2.1 of acquisition process " + str(e))
                        # ignore this exception
                        pass

                # update tbl_analog_value_latest
                delete_values = " DELETE FROM tbl_analog_value_latest WHERE point_id IN ( "
                latest_values = (" INSERT INTO tbl_analog_value_latest (point_id, utc_date_time, actual_value) "
                                 " VALUES  ")
                latest_value_count = 0

                for point_value in analog_value_list:
                    delete_values += str(point_value['point_id']) + ","
                    latest_values += " (" + str(point_value['point_id']) + ","
                    latest_values += "'" + current_datetime_utc.isoformat() + "',"
                    latest_values += str(point_value['value']) + "), "
                    latest_value_count += 1

                if latest_value_count > 0:
                    try:
                        # replace "," at the end of string with ")"
                        cursor_historical_db.execute(delete_values[:-1] + ")")
                        cnx_historical_db.commit()
                    except Exception as e:
                        logger.error("Error in step 4.2.2 of acquisition process " + str(e))
                        # ignore this exception
                        pass

                    try:
                        # trim ", " at the end of string and then execute
                        cursor_historical_db.execute(latest_values[:-2])
                        cnx_historical_db.commit()
                    except Exception as e:
                        logger.error("Error in step 4.2.3 of acquisition process " + str(e))
                        # ignore this exception
                        pass

            if len(energy_value_list) > 0:
                add_values = (" INSERT INTO tbl_energy_value (point_id, utc_date_time, actual_value) "
                              " VALUES  ")
                trend_value_count = 0

                for point_value in energy_value_list:
                    if point_value['is_trend']:
                        add_values += " (" + str(point_value['point_id']) + ","
                        add_values += "'" + current_datetime_utc.isoformat() + "',"
                        add_values += str(point_value['value']) + "), "
                        trend_value_count += 1

                if trend_value_count > 0:
                    try:
                        # trim ", " at the end of string and then execute
                        cursor_historical_db.execute(add_values[:-2])
                        cnx_historical_db.commit()
                    except Exception as e:
                        logger.error("Error in step 4.3.1 of acquisition process: " + str(e))
                        # ignore this exception
                        pass

                # update tbl_energy_value_latest
                delete_values = " DELETE FROM tbl_energy_value_latest WHERE point_id IN ( "
                latest_values = (" INSERT INTO tbl_energy_value_latest (point_id, utc_date_time, actual_value) "
                                 " VALUES  ")

                latest_value_count = 0
                for point_value in energy_value_list:
                    delete_values += str(point_value['point_id']) + ","
                    latest_values += " (" + str(point_value['point_id']) + ","
                    latest_values += "'" + current_datetime_utc.isoformat() + "',"
                    latest_values += str(point_value['value']) + "), "
                    latest_value_count += 1

                if latest_value_count > 0:
                    try:
                        # replace "," at the end of string with ")"
                        cursor_historical_db.execute(delete_values[:-1] + ")")
                        cnx_historical_db.commit()

                    except Exception as e:
                        logger.error("Error in step 4.3.2 of acquisition process " + str(e))
                        # ignore this exception
                        pass

                    try:
                        # trim ", " at the end of string and then execute
                        cursor_historical_db.execute(latest_values[:-2])
                        cnx_historical_db.commit()

                    except Exception as e:
                        logger.error("Error in step 4.3.3 of acquisition process " + str(e))
                        # ignore this exception
                        pass

            if len(digital_value_list) > 0:
                add_values = (" INSERT INTO tbl_digital_value (point_id, utc_date_time, actual_value) "
                              " VALUES  ")
                trend_value_count = 0

                for point_value in digital_value_list:
                    if point_value['is_trend']:
                        add_values += " (" + str(point_value['point_id']) + ","
                        add_values += "'" + current_datetime_utc.isoformat() + "',"
                        add_values += str(point_value['value']) + "), "
                        trend_value_count += 1

                if trend_value_count > 0:
                    try:
                        # trim ", " at the end of string and then execute
                        cursor_historical_db.execute(add_values[:-2])
                        cnx_historical_db.commit()
                    except Exception as e:
                        logger.error("Error in step 4.4.1 of acquisition process: " + str(e))
                        # ignore this exception
                        pass

                # update tbl_digital_value_latest
                delete_values = " DELETE FROM tbl_digital_value_latest WHERE point_id IN ( "
                latest_values = (" INSERT INTO tbl_digital_value_latest (point_id, utc_date_time, actual_value) "
                                 " VALUES  ")
                latest_value_count = 0
                for point_value in digital_value_list:
                    delete_values += str(point_value['point_id']) + ","
                    latest_values += " (" + str(point_value['point_id']) + ","
                    latest_values += "'" + current_datetime_utc.isoformat() + "',"
                    latest_values += str(point_value['value']) + "), "
                    latest_value_count += 1

                if latest_value_count > 0:
                    try:
                        # replace "," at the end of string with ")"
                        cursor_historical_db.execute(delete_values[:-1] + ")")
                        cnx_historical_db.commit()
                    except Exception as e:
                        logger.error("Error in step 4.4.2 of acquisition process " + str(e))
                        # ignore this exception
                        pass

                    try:
                        # trim ", " at the end of string and then execute
                        cursor_historical_db.execute(latest_values[:-2])
                        cnx_historical_db.commit()
                    except Exception as e:
                        logger.error("Error in step 4.4.3 of acquisition process " + str(e))
                        # ignore this exception
                        pass

            if is_read_area_error:
                # destroy the snap7 client
                s7_client.disconnect()
                s7_client.destroy()

                # close the connection to database
                if cursor_historical_db:
                    cursor_historical_db.close()
                if cnx_historical_db:
                    cnx_historical_db.close()

                # break the inner while loop to reconnect the s7 device
                time.sleep(60)
                break

            # sleep some seconds
            time.sleep(config.interval_in_seconds)
        # end of inner while loop

    # end of the outermost while loop

