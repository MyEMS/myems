import falcon
import simplejson as json


class VersionItem:
    def __init__(self):
        """"Initializes VersionItem"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        _=req
        resp.status = falcon.HTTP_200
        _=id_
    @staticmethod
    def on_get(req, resp):
<<<<<<< HEAD
        _=req
        result = {"version": 'MyEMS v5.5.0',
                  "release-date": '2025-05-29',
=======
        result = {"version": 'MyEMS v5.6.0',
                  "release-date": '2025-06-22',
>>>>>>> 4a7b915b0ed7ee6725886ee96232047af7a5256a
                  "licensed-to": 'COMMUNITY',
                  "website": "https://myems.io"}
        resp.text = json.dumps(result)

