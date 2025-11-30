import falcon
import simplejson as json


class VersionItem:
    """
    Version Information Resource

    This class provides version information about the MyEMS system.
    It returns the current version, release date, license type, and website URL.
    """

    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_):
        """
        Handle OPTIONS request for CORS preflight

        Args:
            req: Falcon request object
            resp: Falcon response object
            id_: Version ID parameter (unused)
        """
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp):
        """
        Handle GET requests to retrieve MyEMS version information

        Returns the current version details including:
        - Version number
        - Release date
        - License type
        - Website URL

        Args:
            req: Falcon request object
            resp: Falcon response object
        """
        result = {"version": 'MyEMS v5.11.0',
                  "release-date": '2025-11-30',
                  "licensed-to": 'COMMUNITY',
                  "website": "https://myems.io"}
        resp.text = json.dumps(result)

