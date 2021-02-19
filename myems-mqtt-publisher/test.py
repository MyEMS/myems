import simplejson as json
import config
import time
from datetime import datetime
import paho.mqtt.client as mqtt
import random
import decimal


# global flag indicates the connectivity with the MQTT broker
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
# Test Procedures
# Step 1: Connect the MQTT broker
# Step 2: Publish test topic messages
# Step 3: Run 'mosquitto_sub -h 192.168.0.1 -v -t myems/point/# -u admin -P Password1' to receive test messages
########################################################################################################################

def main():
    global mqtt_connected_flag
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
        print("MQTT Client Connection error " + str(e))
    while True:
        if mqtt_connected_flag:
            try:
                # publish real time value to mqtt broker
                payload = json.dumps({"data_source_id": 1,
                                      "point_id": 3,
                                      "utc_date_time": datetime.utcnow().isoformat(timespec='seconds'),
                                      "value": decimal.Decimal(random.randrange(0, 10000))})
                print('payload=' + str(payload))
                info = mqc.publish('myems/point/' + str(3),
                                   payload=payload,
                                   qos=0,
                                   retain=True)
            except Exception as e:
                print("MQTT Publish Error : " + str(e))
                # ignore this exception, does not stop the procedure
                pass
            time.sleep(1)
        else:
            print('MQTT Client Connection error')
            time.sleep(1)


if __name__ == "__main__":
    main()
