import json
import mysql.connector
import config
import time
from datetime import datetime
import math
from decimal import Decimal
from bacpypes.core import run, stop, deferred
from bacpypes.local.device import LocalDeviceObject
from bacpypes.pdu import Address, GlobalBroadcast

from myems_application import MyEMSApplication


########################################################################################################################
# Acquisition Procedures
# Step 1: Get data source list
# Step 2: Get point list
# Step 3: Read point values from BACnet
# Step 4: Bulk insert point values and update latest values in historical database
########################################################################################################################

def process(logger, ):
    print("Creating a device object...")
    try:
        # make a device object
        this_device = LocalDeviceObject(objectName=config.bacnet_device['object_name'],
                                        objectIdentifier=config.bacnet_device['object_identifier'],
                                        maxApduLengthAccepted=config.bacnet_device['max_apdu_length_accepted'],
                                        segmentationSupported=config.bacnet_device['segmentation_supported'],
                                        vendorIdentifier=config.bacnet_device['vendor_identifier'])

    except Exception as e:
        logger.error("Failed to create BACnet device object: " + str(e))
        # ignore
        pass

    print("Connecting to myems_system_db ...")
    cnx_system_db = None
    cursor_system_db = None

    while not cnx_system_db or not cnx_system_db.is_connected():
        try:
            cnx_system_db = mysql.connector.connect(**config.myems_system_db)
            cursor_system_db = cnx_system_db.cursor()
        except Exception as e:
            logger.error("Error to connect to myems_system_db in acquisition process " + str(e))
            if cursor_system_db:
                cursor_system_db.close()
            if cnx_system_db:
                cnx_system_db.close()
            print("Failed to connect to myems_system_db, sleep a minute and retry...")
            time.sleep(60)
            continue

    print("Connecting to myems_historical_db...")
    cnx_historical_db = None
    cursor_historical_db = None

    while not cnx_historical_db or not cnx_historical_db.is_connected():
        try:
            cnx_historical_db = mysql.connector.connect(**config.myems_historical_db)
            cursor_historical_db = cnx_historical_db.cursor()
        except Exception as e:
            logger.error("Error to connect to myems_historical_db in acquisition process " + str(e))
            if cursor_historical_db:
                cursor_historical_db.close()
            if cnx_historical_db:
                cnx_historical_db.close()
            print("Failed to connect to myems_historical_db, sleep a minute and retry...")
            time.sleep(60)
            continue

    while True:
        # the outermost while loop
        ################################################################################################################
        # Step 1: Get data source list
        ################################################################################################################
        # check the connection to the database
        if not cnx_system_db or not cnx_system_db.is_connected():
            try:
                cnx_system_db = mysql.connector.connect(**config.myems_system_db)
                cursor_system_db = cnx_system_db.cursor()
            except Exception as e:
                logger.error("Error in step 1.1 of acquisition process " + str(e))
                if cursor_system_db:
                    cursor_system_db.close()
                if cnx_system_db:
                    cnx_system_db.close()
                # sleep and retry
                time.sleep(60)
                continue

        # Get data sources by gateway and protocol
        try:
            query = (" SELECT ds.id, ds.name, ds.connection "
                     " FROM tbl_data_sources ds, tbl_gateways g "
                     " WHERE ds.protocol = 'bacnet-ip' AND ds.gateway_id = g.id AND g.id = %s AND g.token = %s "
                     " ORDER BY ds.id ")
            cursor_system_db.execute(query, (config.gateway['id'], config.gateway['token'],))
            rows_data_source = cursor_system_db.fetchall()
        except Exception as e:
            logger.error("Error in step 1.2 of acquisition process " + str(e))
            if cursor_system_db:
                cursor_system_db.close()
            if cnx_system_db:
                cnx_system_db.close()
            # sleep and retry
            time.sleep(60)
            continue

        if rows_data_source is None or len(rows_data_source) == 0:
            logger.error("Step 1.2: Data Source Not Found, Wait for minutes to retry.")
            if cursor_system_db:
                cursor_system_db.close()
            if cnx_system_db:
                cnx_system_db.close()
            # sleep and retry
            time.sleep(60)
            continue

        point_dict = dict()
        bacnet_point_list = list()
        for row_data_source in rows_data_source:
            # print("Data Source: ID=%s, Name=%s, Connection=%s ",
            #       row_data_source[0], row_data_source[1], row_data_source[2])

            if row_data_source[2] is None or len(row_data_source[2]) == 0:
                logger.error("Step 1.2: Data Source Connection Not Found. ID=%s, Name=%s, Connection=%s ",
                             row_data_source[0], row_data_source[1], row_data_source[2])
                # go to next row_data_source in for loop
                continue
            try:
                server = json.loads(row_data_source[2])
            except Exception as e:
                logger.error("Error in step 1.3 of acquisition process: \n"
                             "Invalid Data Source Connection in JSON " + str(e))
                # go to next row_data_source in for loop
                continue

            if 'host' not in server.keys() or server['host'] is None or len(server['host']) == 0:
                logger.error("Step 1.4: Data Source Connection Invalid. ID=%s, Name=%s, Connection=%s ",
                             row_data_source[0], row_data_source[1], row_data_source[2])
                # go to next row_data_source in for loop
                continue

            data_source_id = row_data_source[0]
            data_source_name = row_data_source[1]
            data_source_host = server['host']

            ############################################################################################################
            # Step 2: Get point list
            ############################################################################################################
            try:
                query = (" SELECT id, name, object_type, is_trend, ratio, address "
                         " FROM tbl_points "
                         " WHERE data_source_id = %s "
                         " ORDER BY id ")
                cursor_system_db.execute(query, (data_source_id,))
                rows_points = cursor_system_db.fetchall()
            except Exception as e:
                logger.error("Error in step 2.1 of acquisition process " + str(e))
                if cursor_system_db:
                    cursor_system_db.close()
                if cnx_system_db:
                    cnx_system_db.close()
                # go to next row_data_source in for loop
                continue

            if rows_points is None or len(rows_points) == 0:
                # there is no points for this data source
                logger.error("Error in step 2.1 of acquisition process: \n"
                             "Point Not Found in Data Source (ID = %s, Name = %s) ", data_source_id, data_source_name)
                # go to next row_data_source in for loop
                continue

            # There are points for this data source
            for row_point in rows_points:
                # print("Point in DataSource(ID=%s): ID=%s, Name=%s, ObjectType=%s, IsTrend = %s, Address=%s ",
                #       data_source_id, row_point[0], row_point[1], row_point[2], row_point[3], row_point[4])
                point_id = row_point[0]
                point_name = row_point[1]
                point_object_type = row_point[2]
                is_trend = row_point[3]
                ratio = row_point[4]
                address = json.loads(row_point[5])
                # address example
                # {"object_type":"analogValue", "object_id":3004860, "property_name":"presentValue",
                # "property_array_index":null}
                if 'object_type' not in address.keys() \
                        or address['object_type'] is None \
                        or len(address['object_type']) == 0 \
                        or 'object_id' not in address.keys() \
                        or address['object_id'] is None \
                        or address['object_id'] < 0 \
                        or 'property_name' not in address.keys() \
                        or address['property_name'] is None \
                        or len(address['property_name']) == 0 \
                        or 'property_array_index' not in address.keys():
                    logger.error("Point Address Invalid. ID=%s, Name=%s, Address=%s ",
                                 row_point[0], row_point[1], row_point[5])
                    # go to next row_point in for loop
                    continue

                bacnet_object_type = address['object_type']
                bacnet_object_id = address['object_id']
                bacnet_property_name = address['property_name']
                bacnet_property_array_index = address['property_array_index']

                point_dict[point_id] = {'data_source_id': data_source_id,
                                        'point_name': point_name,
                                        'object_type': point_object_type,
                                        'is_trend': is_trend,
                                        'ratio': ratio,
                                        }
                bacnet_point_list.append((point_id,
                                          data_source_host,
                                          bacnet_object_type,
                                          bacnet_object_id,
                                          bacnet_property_name,
                                          bacnet_property_array_index))
            # end of for row_point
        # end of for row_data_source

        ################################################################################################################
        # Step 3: Read point values from BACnet
        ################################################################################################################
        if point_dict is None or len(point_dict) == 0:
            logger.error("Point Not Found in Step 2")
            continue

        if bacnet_point_list is None or len(bacnet_point_list) == 0:
            logger.error("BACnet Point Not Found in Step 2")
            continue

        if not isinstance(this_device, LocalDeviceObject):
            try:
                # Create a device object
                this_device = LocalDeviceObject(objectName=config.bacnet_device['object_name'],
                                                objectIdentifier=config.bacnet_device['object_identifier'],
                                                maxApduLengthAccepted=config.bacnet_device['max_apdu_length_accepted'],
                                                segmentationSupported=config.bacnet_device['segmentation_supported'],
                                                vendorIdentifier=config.bacnet_device['vendor_identifier'])
            except Exception as e:
                logger.error("Step 3.1 Create BACnet device " + str(e))
                continue

        try:
            # make a BIPForeignApplication
            this_application = MyEMSApplication(bacnet_point_list,
                                                this_device,
                                                config.bacnet_device['local_address'],
                                                Address(config.bacnet_device['foreignBBMD']),
                                                int(config.bacnet_device['foreignTTL']))

            # fire off a request when the core has a chance
            deferred(this_application.next_request)

            run()

            energy_value_list = list()
            analog_value_list = list()
            digital_value_list = list()

            # dump out the results
            for request, response in zip(bacnet_point_list, this_application.response_values):
                # print("request=%s, response=%s ", request, response,)
                point_id = request[0]
                data_source_id = point_dict[point_id]['data_source_id']
                object_type = point_dict[point_id]['object_type']
                is_trend = point_dict[point_id]['is_trend']
                ratio = point_dict[point_id]['ratio']
                if not isinstance(response, int) and \
                    not isinstance(response, float) and \
                    not isinstance(response, bool) and \
                        not isinstance(response, str):
                    # go to next response
                    logger.error("response data type %s, value=%s invalid: request=%s",
                                 type(response), response, request)
                    continue
                else:
                    value = response

                if object_type == 'ANALOG_VALUE':
                    if math.isnan(value):
                        logger.error("response data type is Not A Number: request=%s", request)
                        continue

                    analog_value_list.append({'data_source_id': data_source_id,
                                              'point_id': point_id,
                                              'is_trend': is_trend,
                                              'value': Decimal(value) * ratio})
                elif object_type == 'ENERGY_VALUE':
                    if math.isnan(value):
                        logger.error("response data type is Not A Number: request=%s", request)
                        continue

                    energy_value_list.append({'data_source_id': data_source_id,
                                              'point_id': point_id,
                                              'is_trend': is_trend,
                                              'value': Decimal(value) * ratio})
                elif object_type == 'DIGITAL_VALUE':
                    if isinstance(value, str):
                        if value == 'active':
                            value = 1
                        elif value == 'inactive':
                            value = 0

                    digital_value_list.append({'data_source_id': data_source_id,
                                               'point_id': point_id,
                                               'is_trend': is_trend,
                                               'value': int(value) * int(ratio)})

        except Exception as e:
            logger.error("Step 3.2 ReadPointList " + str(e))
            time.sleep(60)
            continue
        finally:
            this_application.close_socket()
            del this_application

        ################################################################################################################
        # Step 4: Bulk insert point values and update latest values in historical database
        ################################################################################################################
        # check the connection to the database
        if not cnx_historical_db or not cnx_historical_db.is_connected():
            try:
                cnx_historical_db = mysql.connector.connect(**config.myems_historical_db)
                cursor_historical_db = cnx_historical_db.cursor()
            except Exception as e:
                logger.error("Error in step 4.1 of acquisition process " + str(e))

                if cnx_historical_db:
                    cnx_historical_db.close()
                if cursor_historical_db:
                    cursor_historical_db.close()
                # sleep and continue outer while loop to reconnect to server
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

        # sleep some seconds
        time.sleep(config.interval_in_seconds)
        # end of the outermost while loop
