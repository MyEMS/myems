import json
import mysql.connector
import time
import simplejson as json
import paho.mqtt.client as mqtt
import config


# indicates the connectivity with the MQTT broker
mqtt_connected_flag = False


# the on_connect callback function for MQTT client
# refer to http://www.steves-internet-guide.com/client-connections-python-mqtt/
def on_mqtt_connect(client, userdata, flags, rc):
    global mqtt_connected_flag
    if rc == 0:
        mqtt_connected_flag = True  # set flag
        print("MQTT connected OK")
    else:
        print("Bad MQTT connection Returned code=", rc)
        mqtt_connected_flag = False


# the on_disconnect callback function for MQTT client
# refer to http://www.steves-internet-guide.com/client-connections-python-mqtt/
def on_mqtt_disconnect(client, userdata, rc=0):
    global mqtt_connected_flag

    print("DisConnected, result code "+str(rc))
    mqtt_connected_flag = False


########################################################################################################################
# Acquisition Procedures
# Step 1: Get point list
# Step 2: Connect to the historical database
# Step 3: Connect to the MQTT broker
# Step 4: Read point values from latest tables in historical database
# Step 5: Publish point values
########################################################################################################################
def process(logger, object_type):

    while True:
        # the outermost while loop

        ################################################################################################################
        # Step 1: Get point list
        ################################################################################################################
        cnx_system_db = None
        cursor_system_db = None
        try:
            cnx_system_db = mysql.connector.connect(**config.myems_system_db)
            cursor_system_db = cnx_system_db.cursor()
        except Exception as e:
            logger.error("Error in step 1.1 of acquisition process " + str(e))
            if cursor_system_db:
                cursor_system_db.close()
            if cnx_system_db:
                cnx_system_db.close()
            # sleep and then continue the outermost loop to reload points
            time.sleep(60)
            continue

        try:
            if object_type == 'ANALOG_VALUE':
                query = (" SELECT id, name, data_source_id "
                         " FROM tbl_points"
                         " WHERE object_type = 'ANALOG_VALUE' "
                         " ORDER BY id ")
            elif object_type == 'DIGITAL_VALUE':
                query = (" SELECT id, name, data_source_id "
                         " FROM tbl_points"
                         " WHERE object_type = 'DIGITAL_VALUE' "
                         " ORDER BY id ")
            elif object_type == 'ENERGY_VALUE':
                query = (" SELECT id, name, data_source_id "
                         " FROM tbl_points"
                         " WHERE object_type = 'ENERGY_VALUE' "
                         " ORDER BY id ")

            cursor_system_db.execute(query, )
            rows_point = cursor_system_db.fetchall()
        except Exception as e:
            logger.error("Error in step 1.2 of acquisition process: " + str(e))
            # sleep several minutes and continue the outer loop to reload points
            time.sleep(60)
            continue
        finally:
            if cursor_system_db:
                cursor_system_db.close()
            if cnx_system_db:
                cnx_system_db.close()

        if rows_point is None or len(rows_point) == 0:
            # there is no points
            logger.error("Point Not Found, acquisition process terminated ")
            # sleep 60 seconds and go back to the begin of outermost while loop to reload points
            time.sleep(60)
            continue

        point_dict = dict()
        for row_point in rows_point:
            point_dict[row_point[0]] = {'name': row_point[1], 'data_source_id': row_point[2]}

        ################################################################################################################
        # Step 2: Connect to the historical database
        ################################################################################################################
        cnx_historical_db = None
        cursor_historical_db = None
        try:
            cnx_historical_db = mysql.connector.connect(**config.myems_historical_db)
            cursor_historical_db = cnx_historical_db.cursor()
        except Exception as e:
            logger.error("Error in step 2.1 of acquisition process " + str(e))
            if cursor_historical_db:
                cursor_historical_db.close()
            if cnx_historical_db:
                cnx_historical_db.close()
            # sleep 60 seconds and go back to the begin of outermost while loop to reload points
            time.sleep(60)
            continue

        ################################################################################################################
        # Step 3: Connect to the MQTT broker
        ################################################################################################################
        mqc = None
        try:
            mqc = mqtt.Client(client_id='MYEMS' + "-" + str(time.time()))
            mqc.username_pw_set(config.myems_mqtt_broker['username'], config.myems_mqtt_broker['password'])
            mqc.on_connect = on_mqtt_connect
            mqc.on_disconnect = on_mqtt_disconnect
            mqc.connect_async(config.myems_mqtt_broker['host'], config.myems_mqtt_broker['port'], 60)
            # The loop_start() starts a new thread, that calls the loop method at regular intervals for you.
            # It also handles re-connects automatically.
            mqc.loop_start()

        except Exception as e:
            logger.error("Error in step 3.1 of acquisition process " + str(e))
            # sleep 60 seconds and go back to the begin of outermost while loop to reload points
            time.sleep(60)
            continue

        ################################################################################################################
        # Step 4: Read point values from latest tables in historical database
        ################################################################################################################
        # inner loop to read all point latest values and publish them within a period
        while True:
            if object_type == 'ANALOG_VALUE':
                query = " SELECT point_id, utc_date_time, actual_value" \
                        " FROM tbl_analog_value_latest WHERE point_id IN ( "
            elif object_type == 'DIGITAL_VALUE':
                query = " SELECT point_id, utc_date_time, actual_value" \
                        " FROM tbl_digital_value_latest WHERE point_id IN ( "
            elif object_type == 'ENERGY_VALUE':
                query = " SELECT point_id, utc_date_time, actual_value" \
                        " FROM tbl_energy_value_latest WHERE point_id IN ( "

            for point_id in point_dict:
                query += str(point_id) + ","

            try:
                # replace "," at the end of string with ")"
                cursor_historical_db.execute(query[:-1] + ")")
                rows_point_values = cursor_historical_db.fetchall()
            except Exception as e:
                logger.error("Error in step 4.1 of acquisition process " + str(e))
                if cursor_historical_db:
                    cursor_historical_db.close()
                if cnx_historical_db:
                    cnx_historical_db.close()

                # destroy mqtt client
                if mqc and mqc.is_connected():
                    mqc.disconnect()
                del mqc
                # break the inner while loop
                break

            if rows_point_values is None or len(rows_point_values) == 0:
                # there is no points
                print(" Point value Not Found")

                # sleep 60 seconds and go back to the begin of inner while loop
                time.sleep(60)
                continue

            point_value_list = list()
            for row_point_value in rows_point_values:
                point_id = row_point_value[0]
                point = point_dict.get(point_id)
                data_source_id = point['data_source_id']
                utc_date_time = row_point_value[1].replace(tzinfo=None).isoformat(timespec='seconds')
                value = row_point_value[2]
                point_value_list.append({'data_source_id': data_source_id,
                                         'point_id': point_id,
                                         'object_type': object_type,
                                         'utc_date_time': utc_date_time,
                                         'value': value})

            ############################################################################################################
            # Step 5: Publish point values
            ############################################################################################################

            if len(point_value_list) > 0 and mqtt_connected_flag:
                for point_value in point_value_list:
                    try:
                        # publish real time value to mqtt broker
                        topic = config.topic_prefix + str(point_value['point_id'])
                        print('topic=' + topic)
                        payload = json.dumps({'data_source_id': point_value['data_source_id'],
                                              'point_id': point_value['point_id'],
                                              'object_type': point_value['object_type'],
                                              'utc_date_time': point_value['utc_date_time'],
                                              'value': point_value['value']})
                        print('payload=' + str(payload))
                        info = mqc.publish(topic=topic,
                                           payload=payload,
                                           qos=config.qos,
                                           retain=True)
                    except Exception as e:
                        logger.error("Error in step 5 of acquisition process: " + str(e))
                        if cursor_historical_db:
                            cursor_historical_db.close()
                        if cnx_historical_db:
                            cnx_historical_db.close()

                        # destroy mqtt client
                        if mqc and mqc.is_connected():
                            mqc.disconnect()
                        del mqc

                        # break the inner while loop
                        break

            # sleep some seconds
            time.sleep(config.interval_in_seconds)
        # end of inner while loop

    # end of outermost while loop
