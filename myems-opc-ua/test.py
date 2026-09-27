import asyncio
import telnetlib
from urllib.parse import urlparse
from asyncua import Client


async def main():
    url = "opc.tcp://192.168.0.1:53530/OPCUA/SimulationServer/"
    # url = "opc.tcp://olivier:olivierpass@localhost:53530/OPCUA/SimulationServer/"
    try:
        server_url = urlparse(url)
        telnetlib.Telnet(server_url.hostname, server_url.port, 10)
        print("Succeeded to telnet %s:%s in acquisition process ", server_url.hostname, server_url.port)
    except Exception as e:
        print("Failed to telnet %s:%s in acquisition process: %s  ", server_url.hostname, server_url.port, str(e))
        return

    try:
        async with Client(url=url) as client:
            var1 = client.get_node('ns=3;s=Counter')
            print("var1 is: ", var1)
            print("value of var1 is: ", await var1.get_value())

            var2 = client.get_node('ns=3;s=Expression')
            print("var2 is: ", var2)
            print("value of var2 is: ", await var2.get_value())

            var3 = client.get_node('ns=3;s=Random')
            print("var3 is: ", var3)
            print("value of var3 is: ", await var3.get_value())

            var4 = client.get_node('ns=3;s=Sawtooth')
            print("var4 is: ", var4)
            print("value of var4 is: ", await var4.get_value())

            var5 = client.get_node('ns=3;s=Sinusoid')
            print("var5 is: ", var5)
            print("value of var5 is: ", await var5.get_value())

            var6 = client.get_node('ns=3;s=Square')
            print("var6 is: ", var6)
            print("value of var6 is: ", await var6.get_value())

            var7 = client.get_node('ns=3;s=Triangle')
            print("var7 is: ", var7)
            print("value of var7 is: ", await var7.get_value())

    except Exception as e:
        print('error: ' + str(e))

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.set_debug(True)
    loop.run_until_complete(main())
    loop.close()
