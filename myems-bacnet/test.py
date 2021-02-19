from bacpypes.core import run, stop, deferred
from bacpypes.local.device import LocalDeviceObject
from bacpypes.pdu import Address, GlobalBroadcast
from myems_application import MyEMSApplication
import config


########################################################################################################################
# this procedure tests BACnet/IP environment
########################################################################################################################
def main():

    # make a device object
    this_device = LocalDeviceObject(objectName=config.bacnet_device['object_name'],
                                    objectIdentifier=config.bacnet_device['object_identifier'],
                                    maxApduLengthAccepted=config.bacnet_device['max_apdu_length_accepted'],
                                    segmentationSupported=config.bacnet_device['segmentation_supported'],
                                    vendorIdentifier=config.bacnet_device['vendor_identifier'], )

    # point list, set according to your device
    point_list = [
        # point_id, addr, obj_type, obj_inst, prop_id, idx
        (1, '10.117.73.53', 'analogInput', 1, 'presentValue', None),
        (2, '10.117.73.53', 'analogInput', 2, 'presentValue', None),
        (3, '10.117.73.53', 'analogInput', 3, 'presentValue', None),
        (4, '10.117.73.53', 'analogInput', 4, 'presentValue', None),
        (5, '10.117.73.53', 'analogInput', 5, 'presentValue', None),
        (6, '10.117.73.53', 'analogInput', 6, 'presentValue', None),
    ]

    # make a simple application
    this_application = MyEMSApplication(point_list,
                                        this_device,
                                        config.bacnet_device['local_address'],
                                        Address(config.bacnet_device['foreignBBMD']),
                                        int(config.bacnet_device['foreignTTL']))

    # fire off a request when the core has a chance
    deferred(this_application.next_request)

    run()

    # dump out the results
    for request, response in zip(point_list, this_application.response_values):
        print(request, response)


if __name__ == "__main__":
    main()
