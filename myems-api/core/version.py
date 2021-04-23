import falcon
import simplejson as json


class VersionItem:
    @staticmethod
    def __init__():
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp):

        result = {"version": 'MyEMS v1.1.2',
                  "release-date": '202104023',
                  "website": "https://myems.io"}
        resp.body = json.dumps(result)

