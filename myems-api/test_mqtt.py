import decimal
import random
import time
from datetime import datetime
import paho.mqtt.client as mqtt
import simplejson as json
import config

# global bool variable that indicates the connectivity with the MQTT broker
g_mqtt_connected_flag = False


# the on_connect callback function for MQTT client
# refer to http://www.steves-internet-guide.com/client-connections-python-mqtt/
def on_mqtt_connect(client, userdata, connect_flags, reason_code, properties):
    global g_mqtt_connected_flag
    if reason_code == 0:
        g_mqtt_connected_flag = True
        client.connected_flag = True
        client.disconnect_flag = False
        print("MQTT connected OK")
    else:
        g_mqtt_connected_flag = False
        client.bad_connection_flag = True
        print("Bad MQTT connection reason code=", reason_code)


# the on_disconnect callback function for MQTT client
def on_mqtt_disconnect(client, userdata, disconnect_flags, reason_code, properties):
    global g_mqtt_connected_flag
    g_mqtt_connected_flag = False
    client.connected_flag = False
    client.disconnect_flag = True
    print("Disconnected reason code " + str(reason_code))


########################################################################################################################
# Test Procedures
# Step 1: Connect the MQTT broker
# Step 2: Publish test topic messages
# Step 3: Run 'mosquitto_sub -h 192.168.0.1 -v -t myems/point/# -u admin -P Password1' to receive test messages
########################################################################################################################

def main():
    global g_mqtt_connected_flag
    mqc = None
    try:
        mqc = mqtt.Client(callback_api_version=mqtt.CallbackAPIVersion.VERSION2,
                          client_id='MYEMS' + datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S"),
                          clean_session=None,
                          userdata=None,
                          protocol=mqtt.MQTTv5,
                          transport='tcp',
                          reconnect_on_failure=True,
                          manual_ack=False)
        mqc.username_pw_set(config.myems_mqtt_broker['username'], config.myems_mqtt_broker['password'])
        mqc.on_connect = on_mqtt_connect
        mqc.on_disconnect = on_mqtt_disconnect
        mqc.connect_async(config.myems_mqtt_broker['host'], config.myems_mqtt_broker['port'], 60)
        # The loop_start() starts a new thread, that calls the loop method at regular intervals for you.
        # It also handles re-connects automatically.
        mqc.loop_start()

    except Exception as e:
        print("MQTT Client Connection error " + str(e))

    while True:
        if g_mqtt_connected_flag:
            try:
                # publish real time value to mqtt broker
                payload = json.dumps({"data_source_id": 1,
                                      "point_id": 1,
                                      "utc_date_time": datetime.utcnow().isoformat(timespec='seconds'),
                                      "value": decimal.Decimal(random.randrange(0, 10000))})
                print('payload=' + str(payload))
                info = mqc.publish('testtopic',
                                   payload=payload,
                                   qos=0,
                                   retain=True)
            except Exception as e:
                print("MQTT Publish Error : " + str(e))
                # ignore this exception, does not stop the procedure

            time.sleep(1)
        else:
            print('MQTT Client Connection error')
            time.sleep(1)


if __name__ == "__main__":
    main()
