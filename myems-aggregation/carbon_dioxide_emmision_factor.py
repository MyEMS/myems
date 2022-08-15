import mysql.connector
import config


########################################################################################################################
# Get carbon dioxide emission factor by energy category
########################################################################################################################
def get_energy_category_factor(energy_category_id, start_datetime_utc, end_datetime_utc):
    # todo: verify parameters
    # todo: add start_datetime_utc and end_datetime_utc to factor
    # get timezone offset in minutes, this value will be returned to client
    timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
    if config.utc_offset[0] == '-':
        timezone_offset = -timezone_offset

    cnx = None
    cursor = None
    try:
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()
        query_factors = (" SELECT kgco2e "
                         " FROM tbl_energy_categories "
                         " WHERE id = %s ")
        cursor.execute(query_factors, (energy_category_id,))
        rows_factor = cursor.fetchone()
    except Exception as e:
        print(str(e))
        return None
    finally:
        if cursor:
            cursor.close()
        if cnx:
            cnx.close()

    if rows_factor is None:
        if cursor:
            cursor.close()
        if cnx:
            cnx.close()
        return None
    else:
        return rows_factor[0]


########################################################################################################################
# Get carbon dioxide emission factor by energy item
########################################################################################################################
def get_energy_item_tariffs(energy_item_id, start_datetime_utc, end_datetime_utc):
    # todo: verify parameters
    # todo: add start_datetime_utc and end_datetime_utc to factor
    # get timezone offset in minutes, this value will be returned to client
    timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
    if config.utc_offset[0] == '-':
        timezone_offset = -timezone_offset

    cnx = None
    cursor = None
    try:
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()
        query_factors = (" SELECT ec.kgco2e "
                         " FROM tbl_energy_categories ec, tbl_energy_items ei "
                         " WHERE ei.id = %s AND ei.energy_category_id = ec.id ")
        cursor.execute(query_factors, (energy_item_id,))
        rows_factor = cursor.fetchone()
    except Exception as e:
        print(str(e))
        return None
    finally:
        if cursor:
            cursor.close()
        if cnx:
            cnx.close()

    if rows_factor is None:
        if cursor:
            cursor.close()
        if cnx:
            cnx.close()
        return None
    else:
        return rows_factor[0]
