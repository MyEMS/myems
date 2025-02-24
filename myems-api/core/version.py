import falcon
import simplejson as json


class VersionItem:
    def __init__(self):
        """"Initializes VersionItem"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp):
        result = {"version": 'MyEMS v5.2.0',
                  "release-date": '2025-02-25',
                  "licensed-to": 'COMMUNITY',
                  "website": "https://myems.io"}
        resp.text = json.dumps(result)

