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
        result = {"version": 'MyEMS v6.6.0',
                  "release-date": '2026-06-26',
                  "licensed-to": 'COMMUNITY',
                  "website": "https://myems.cn"}
        resp.text = json.dumps(result)
