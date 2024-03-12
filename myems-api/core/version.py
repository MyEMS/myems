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
        result = {"version": 'MyEMS v4.3.0',
                  "release-date": '2024-03-11',
                  "licensed-to": 'COMMUNITY',
                  "website": "https://myems.io"}
        resp.text = json.dumps(result)

