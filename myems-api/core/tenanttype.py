import uuid
import re
import falcon
import mysql.connector
import simplejson as json
from core.useractivity import user_logger, admin_control, access_control, api_key_control
import config


class TenantTypeCollection:
    @staticmethod
    def __init__():
        """"Initializes TenantTypeCollection"""
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp):
        if 'API-KEY' not in req.headers or \
                not isinstance(req.headers['API-KEY'], str) or \
                len(str.strip(req.headers['API-KEY'])) == 0:
            access_control(req)
        else:
            api_key_control(req)
        cnx = None
        cursor = None
        try:
            cnx = mysql.connector.connect(**config.myems_system_db)
            cursor = cnx.cursor(dictionary=True)
            query = (" SELECT id, name, uuid, description, simplified_code "
                     " FROM tbl_tenant_types "
                     " ORDER BY id ")
            cursor.execute(query)
            rows = cursor.fetchall()
            
            if rows is None:
                resp.text = json.dumps([])
                return
                
            result = []
            for row in rows:
                result.append({
                    "id": row['id'],
                    "name": row['name'],
                    "uuid": row['uuid'],
                    "description": row['description'],
                    "simplified_code": row['simplified_code']
                })
            
            resp.text = json.dumps(result)
            
        except Exception as ex:
            raise falcon.HTTPError(falcon.HTTP_500, 'API.INTERNAL_ERROR', str(ex))
        finally:
            if cursor:
                cursor.close()
            if cnx:
                cnx.close()

    @staticmethod
    @user_logger
    def on_post(req, resp):
        """Handles POST requests to create a new tenant type"""
        admin_control(req)  # 仅管理员可操作
        
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(falcon.HTTP_400, 'API.ERROR_READING_REQUEST_STREAM', str(ex))

        try:
            new_values = json.loads(raw_json)
        except Exception:
            raise falcon.HTTPError(falcon.HTTP_400, 'API.INVALID_JSON_FORMAT',
                                   'Failed to decode the request body as JSON.')
        if 'data' not in new_values:
            raise falcon.HTTPError(falcon.HTTP_400, 'API.MISSING_DATA_KEY',
                                   'The request must include a "data" object.')
        
        data = new_values['data']
    
        required_fields = ['name', 'simplified_code']
        for field in required_fields:
            if field not in data or not isinstance(data[field], str) or len(str.strip(data[field])) == 0:
                raise falcon.HTTPError(falcon.HTTP_400, 'API.BAD_REQUEST',
                                       f'Invalid or missing value for: {field}')
        
        name = str.strip(data['name'])
        simplified_code = str.strip(data['simplified_code']).upper()
        
        if len(name) < 2 or len(name) > 100:
            raise falcon.HTTPError(falcon.HTTP_400, 'API.BAD_REQUEST',
                                   'Tenant type name must be between 2-100 characters')
        
        if not re.match(r'^[A-Z0-9]{2,20}$', simplified_code):
            raise falcon.HTTPError(falcon.HTTP_400, 'API.BAD_REQUEST',
                                   'Simplified code must be 2-20 uppercase alphanumeric characters')
        
        description = str.strip(data['description']) if 'description' in data and data['description'] is not None else None

        cnx = None
        cursor = None
        try:
            cnx = mysql.connector.connect(**config.myems_system_db)
            cursor = cnx.cursor()
            
            cursor.execute(" SELECT name FROM tbl_tenant_types WHERE name = %s ", (name,))
            if cursor.fetchone() is not None:
                raise falcon.HTTPError(falcon.HTTP_400, 'API.BAD_REQUEST',
                                       f'Tenant type name "{name}" is already in use')

            cursor.execute(" SELECT simplified_code FROM tbl_tenant_types WHERE simplified_code = %s ", 
                          (simplified_code,))
            if cursor.fetchone() is not None:
                raise falcon.HTTPError(falcon.HTTP_400, 'API.BAD_REQUEST',
                                       f'Simplified code "{simplified_code}" is already in use')

            add_row = (" INSERT INTO tbl_tenant_types "
                       " (name, uuid, description, simplified_code) "
                       " VALUES (%s, %s, %s, %s) ")
            cursor.execute(add_row, (name, 
                                    str(uuid.uuid4()), 
                                    description, 
                                    simplified_code))
            new_id = cursor.lastrowid
            cnx.commit()

            resp.status = falcon.HTTP_201
            resp.location = '/tenanttypes/' + str(new_id)
            
        except mysql.connector.Error as err:
            if cnx:
                cnx.rollback()
            if err.errno == mysql.connector.errorcode.ER_DUP_ENTRY:
                raise falcon.HTTPError(falcon.HTTP_400, 'API.DUPLICATE_ENTRY', str(err))
            else:
                raise falcon.HTTPError(falcon.HTTP_500, 'API.DATABASE_ERROR', str(err))
        except Exception as ex:
            if cnx:
                cnx.rollback()
            raise falcon.HTTPError(falcon.HTTP_500, 'API.INTERNAL_ERROR', str(ex))
        finally:
            if cursor:
                cursor.close()
            if cnx:
                cnx.close()

class TenantTypeItem:
    @staticmethod
    def __init__():
        """"Initializes TenantTypeItem"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_):
        if 'API-KEY' not in req.headers or \
                not isinstance(req.headers['API-KEY'], str) or \
                len(str.strip(req.headers['API-KEY'])) == 0:
            access_control(req)
        else:
            api_key_control(req)
            
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, 'API.BAD_REQUEST',
                                   'Tenant type ID must be a positive integer')

        cnx = None
        cursor = None
        try:
            cnx = mysql.connector.connect(**config.myems_system_db)
            cursor = cnx.cursor(dictionary=True)
            
            query = (" SELECT id, name, uuid, description, simplified_code "
                     " FROM tbl_tenant_types "
                     " WHERE id = %s ")
            cursor.execute(query, (id_,))
            row = cursor.fetchone()
            
            if row is None:
                raise falcon.HTTPError(falcon.HTTP_404, 'API.NOT_FOUND',
                                       f'Tenant type with ID {id_} not found')
            
            resp.text = json.dumps({
                "id": row['id'],
                "name": row['name'],
                "uuid": row['uuid'],
                "description": row['description'],
                "simplified_code": row['simplified_code']
            })
            
        except Exception as ex:
            raise falcon.HTTPError(falcon.HTTP_500, 'API.INTERNAL_ERROR', str(ex))
        finally:
            if cursor:
                cursor.close()
            if cnx:
                cnx.close()

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_):
        """Handles DELETE requests to remove a tenant type"""
        admin_control(req)  
        
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, 'API.BAD_REQUEST',
                                   'Tenant type ID must be a positive integer')

        cnx = None
        cursor = None
        try:
            cnx = mysql.connector.connect(**config.myems_system_db)
            cursor = cnx.cursor()
            
            cursor.execute(" SELECT name FROM tbl_tenant_types WHERE id = %s ", (id_,))
            if cursor.fetchone() is None:
                raise falcon.HTTPError(falcon.HTTP_404, 'API.NOT_FOUND',
                                       f'Tenant type with ID {id_} not found')

            cursor.execute(" SELECT id FROM tbl_tenants WHERE tenant_type_id = %s LIMIT 1 ", (id_,))
            if cursor.fetchone() is not None:
                raise falcon.HTTPError(falcon.HTTP_400, 'API.BAD_REQUEST',
                                       'Cannot delete tenant type because it is in use by tenants')

            cursor.execute(" DELETE FROM tbl_tenant_types WHERE id = %s ", (id_,))
            cnx.commit()
            
            resp.status = falcon.HTTP_204
            
        except mysql.connector.Error as err:
            if cnx:
                cnx.rollback()
            raise falcon.HTTPError(falcon.HTTP_500, 'API.DATABASE_ERROR', str(err))
        except Exception as ex:
            if cnx:
                cnx.rollback()
            raise falcon.HTTPError(falcon.HTTP_500, 'API.INTERNAL_ERROR', str(ex))
        finally:
            if cursor:
                cursor.close()
            if cnx:
                cnx.close()

    @staticmethod
    @user_logger
    def on_put(req, resp, id_):
        """Handles PUT requests to update a tenant type"""
        admin_control(req)  
        
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, 'API.BAD_REQUEST',
                                   'Tenant type ID must be a positive integer')

        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(falcon.HTTP_400, 'API.ERROR_READING_REQUEST_STREAM', str(ex))

        try:
            new_values = json.loads(raw_json)
        except Exception:
            raise falcon.HTTPError(falcon.HTTP_400, 'API.INVALID_JSON_FORMAT',
                                   'Failed to decode the request body as JSON.')
        
        if 'data' not in new_values:
            raise falcon.HTTPError(falcon.HTTP_400, 'API.MISSING_DATA_KEY',
                                   'The request must include a "data" object.')
        
        data = new_values['data']
        
        required_fields = ['name', 'simplified_code']
        for field in required_fields:
            if field not in data or not isinstance(data[field], str) or len(str.strip(data[field])) == 0:
                raise falcon.HTTPError(falcon.HTTP_400, 'API.BAD_REQUEST',
                                       f'Invalid or missing value for: {field}')
        
        name = str.strip(data['name'])
        simplified_code = str.strip(data['simplified_code']).upper()
        
        if len(name) < 2 or len(name) > 100:
            raise falcon.HTTPError(falcon.HTTP_400, 'API.BAD_REQUEST',
                                   'Tenant type name must be between 2-100 characters')
        
        if not re.match(r'^[A-Z0-9]{2,20}$', simplified_code):
            raise falcon.HTTPError(falcon.HTTP_400, 'API.BAD_REQUEST',
                                   'Simplified code must be 2-20 uppercase alphanumeric characters')
        
        description = str.strip(data['description']) if 'description' in data and data['description'] is not None else None

        cnx = None
        cursor = None
        try:
            cnx = mysql.connector.connect(**config.myems_system_db)
            cursor = cnx.cursor()
            
            cursor.execute(" SELECT name FROM tbl_tenant_types WHERE id = %s ", (id_,))
            if cursor.fetchone() is None:
                raise falcon.HTTPError(falcon.HTTP_404, 'API.NOT_FOUND',
                                       f'Tenant type with ID {id_} not found')

            cursor.execute(" SELECT id FROM tbl_tenant_types WHERE name = %s AND id != %s ", 
                          (name, id_))
            if cursor.fetchone() is not None:
                raise falcon.HTTPError(falcon.HTTP_400, 'API.BAD_REQUEST',
                                       f'Tenant type name "{name}" is already in use')

            cursor.execute(" SELECT id FROM tbl_tenant_types WHERE simplified_code = %s AND id != %s ",
                          (simplified_code, id_))
            if cursor.fetchone() is not None:
                raise falcon.HTTPError(falcon.HTTP_400, 'API.BAD_REQUEST',
                                       f'Simplified code "{simplified_code}" is already in use')

            update_row = (" UPDATE tbl_tenant_types "
                         " SET name = %s, description = %s, simplified_code = %s "
                         " WHERE id = %s ")
            cursor.execute(update_row, (name, 
                                        description, 
                                        simplified_code, 
                                        id_))
            cnx.commit()
        
            resp.status = falcon.HTTP_200
            
        except mysql.connector.Error as err:
            if cnx:
                cnx.rollback()
            if err.errno == mysql.connector.errorcode.ER_DUP_ENTRY:
                raise falcon.HTTPError(falcon.HTTP_400, 'API.DUPLICATE_ENTRY', str(err))
            else:
                raise falcon.HTTPError(falcon.HTTP_500, 'API.DATABASE_ERROR', str(err))
        except Exception as ex:
            if cnx:
                cnx.rollback()
            raise falcon.HTTPError(falcon.HTTP_500, 'API.INTERNAL_ERROR', str(ex))
        finally:
            if cursor:
                cursor.close()
            if cnx:
                cnx.close()