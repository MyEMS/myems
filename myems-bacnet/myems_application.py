from collections import deque

from bacpypes.app import BIPForeignApplication
from bacpypes.core import stop, deferred
from bacpypes.iocb import IOCB

from bacpypes.pdu import Address
from bacpypes.object import get_datatype

from bacpypes.apdu import ReadPropertyRequest, Error, AbortPDU, ReadPropertyACK
from bacpypes.primitivedata import Unsigned
from bacpypes.constructeddata import Array


class MyEMSApplication(BIPForeignApplication):

    def __init__(self, point_list, *args):

        BIPForeignApplication.__init__(self, *args)

        # turn the point list into a queue
        self.point_queue = deque(point_list)

        # make a list of the response values
        self.response_values = []

    def next_request(self):

        # check to see if we're done
        if not self.point_queue:
            stop()
            return

        # get the next request
        point_id, addr, obj_type, obj_inst, prop_id, idx = self.point_queue.popleft()

        # build a request
        request = ReadPropertyRequest(
            objectIdentifier=(obj_type, obj_inst),
            propertyIdentifier=prop_id,
            propertyArrayIndex=idx
            )
        request.pduDestination = Address(addr)

        # make an IOCB
        iocb = IOCB(request)

        # set a callback for the response
        iocb.add_callback(self.complete_request)

        # send the request
        self.request_io(iocb)

    def complete_request(self, iocb):
        if iocb.ioResponse:
            apdu = iocb.ioResponse

            # find the datatype
            datatype = get_datatype(apdu.objectIdentifier[0], apdu.propertyIdentifier)
            if not datatype:
                raise TypeError("unknown datatype")

            # special case for array parts, others are managed by cast_out
            if issubclass(datatype, Array) and (apdu.propertyArrayIndex is not None):
                if apdu.propertyArrayIndex == 0:
                    value = apdu.propertyValue.cast_out(Unsigned)
                else:
                    value = apdu.propertyValue.cast_out(datatype.subtype)
            else:
                value = apdu.propertyValue.cast_out(datatype)

            # save the value
            self.response_values.append(value)

        if iocb.ioError:
            self.response_values.append(iocb.ioError)

        # fire off another request
        deferred(self.next_request)
