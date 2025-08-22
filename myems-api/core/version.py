import falcon
import simplejson as json


class VersionItem:
    def __init__(self):
        """"Initializes VersionItem"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp):
        result = {"version": 'MyEMS v5.7.1',
                  "release-date": '2025-08-02',
                  "licensed-to": 'COMMUNITY',
                  "website": "https://myems.io"}
        resp.text = json.dumps(result)

