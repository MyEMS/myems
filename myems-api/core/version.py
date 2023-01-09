import falcon
import simplejson as json


class VersionItem:
    @staticmethod
    def __init__():
        """"Initializes VersionItem"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp):

        result = {"version": 'MyEMS v2.11.0',
                  "release-date": '2023-01-09',
                  "website": "https://myems.io"}
        resp.text = json.dumps(result)

