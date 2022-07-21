import time
from datetime import datetime, timedelta
import mysql.connector
from openpyxl import load_workbook
from decimal import Decimal
import config

################################################################################################################
# PROCEDURES:
# STEP 1: get all 'new' offline meter files
# STEP 2: for each new files, iterate all rows and read cell's value and store data to energy data list
# STEP 3: insert or update energy data to table offline meter hourly in energy database
# STEP 4: update file status to 'done' or 'error'
################################################################################################################


def do(logger):
    while True:
        # outer loop to reconnect server if there is a connection error
        ################################################################################################################
        # STEP 1: get all 'new' data repair files
        ################################################################################################################
        cnx = None
        cursor = None
        try:
            cnx = mysql.connector.connect(**config.myems_historical_db)
            cursor = cnx.cursor()
        except Exception as e:
            logger.error("Error in step 1.1 of offline meter.calculate_hourly " + str(e))
            if cursor:
                cursor.close()
            if cnx:
                cnx.close()
            # sleep several minutes and continue the outer loop to reconnect the database
            print("Could not connect the MyEMS Historical Database, and go to sleep 60 seconds...")
            time.sleep(60)
            continue

        print("Connected to MyEMS Historical Database")

        print("Getting all new data repair files")
        try:
            query = (" SELECT id, file_name, file_object "
                     " FROM tbl_data_repair_files "
                     " WHERE status = 'new' "
                     " ORDER BY id ")

            cursor.execute(query, )
            rows_files = cursor.fetchall()
        except Exception as e:
            logger.error("Error in step 1.2 of offline meter.calculate_hourly " + str(e))
            time.sleep(60)
            continue
        finally:
            if cursor:
                cursor.close()
            if cnx:
                cnx.close()

        excel_file_list = list()
        if rows_files is not None and len(rows_files) > 0:
            for row_file in rows_files:
                excel_file_list.append({"id": row_file[0],
                                        "name": row_file[1],
                                        "file_object": row_file[2]})
        else:
            print("there isn't any new files found, and go to sleep 60 seconds...")
            time.sleep(60)
            continue

        ################################################################################################################
        # STEP 2: for each new files, dump file object to local file and then load workbook from the local file
        ################################################################################################################
        for excel_file in excel_file_list:
            print("read data from data repair file" + excel_file['name'])
            is_valid_file = True
            fw = None
            try:
                fw = open("myems-normalization.blob", 'wb')
                fw.write(excel_file['file_object'])
                fw.close()
            except Exception as e:
                logger.error("Error in step 2.1 of data repair.calculate_hourly " + str(e))
                if fw:
                    fw.close()
                # mark as invalid file
                is_valid_file = False

            fr = None
            wb = None
            try:
                fr = open("myems-normalization.blob", 'rb')
                wb = load_workbook(fr, data_only=True)
                fr.close()
            except Exception as e:
                logger.error("Error in step 2.2 of offline meter.calculate_hourly " + str(e))
                if fr:
                    fr.close()
                # mark as invalid file
                is_valid_file = False

            energy_data_list = list()
            # grab the active worksheet

            if is_valid_file:
                ws = wb.active

                # get timezone offset in minutes, this value will be returned to client
                timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
                if config.utc_offset[0] == '-':
                    timezone_offset = -timezone_offset

                for row in ws.iter_rows(min_row=2, max_row=1024, min_col=1, max_col=4):
                    repair_file_data = dict()
                    repair_file_data['point_id'] = None
                    repair_file_data['point_name'] = None
                    repair_file_data['date_time_utc'] = None
                    repair_file_data['actual_value'] = None
                    col_num = 0

                    for cell in row:
                        col_num += 1
                        if not isinstance(cell.value,type(None)):
                            print(cell.value)
                        if col_num == 1:
                            # get point ID (myems_system_db.tbl_points)
                            if cell.value is not None:
                                repair_file_data['point_id'] = cell.value
                            else:
                                break
                        elif col_num == 2:
                            # get point name
                            if cell.value is None:
                                break
                            else:
                                repair_file_data['point_name'] = cell.value
                        elif col_num == 3:
                            # get date of the cell
                            if cell.value is None:
                                break
                            else:
                                if is_Vaild_Date(cell.value):
                                    start_datetime_local = cell.value
                                    start_datetime_local = datetime.strptime(start_datetime_local, '%Y-%m-%d %H:%M:%S')
                                else:
                                    print("invalid date and go to next cell in this row until reach max_col...")

                            start_datetime_utc = start_datetime_local - timedelta(minutes=timezone_offset)
                            repair_file_data['date_time_utc'] = start_datetime_utc
                       
                        elif col_num == 4:
                            if cell.value is None:
                                break
                            else:
                                repair_file_data['actual_value'] = cell.value

                    if  not isinstance(repair_file_data['point_id'], type(None)):
                        print("repair_file_data:" + str(repair_file_data))
                        energy_data_list.append(repair_file_data)

            ############################################################################################################
            # STEP 3: insert or update energy data to table energy value hourly in system database
            ############################################################################################################
            print("to valid point  id in excel file...")
            if len(energy_data_list) == 0:
                print("Could not find any repair data in the file...")
                print("and go to process the next file...")
                is_valid_file = False
            else:
                try:
                    cnx = mysql.connector.connect(**config.myems_system_db)
                    cursor = cnx.cursor()
                except Exception as e:
                    logger.error("Error in step 3.1 of datarepair.calculate_hourly " + str(e))
                    if cursor:
                        cursor.close()
                    if cnx:
                        cnx.close()
                    time.sleep(60)
                    continue

                try:
                    cursor.execute(" SELECT id, name, low_limit, high_limit"
                                   " FROM tbl_points ")
                    rows_points = cursor.fetchall()
                except Exception as e:
                    logger.error("Error in step 3.2 of datarepair.calculate_hourly " + str(e))
                    time.sleep(60)
                    continue
                finally:
                    if cursor:
                        cursor.close()
                    if cnx:
                        cnx.close()

                if rows_points is None or len(rows_points) == 0:
                    print("Could not find any points in the MyEMS System Database...")
                    time.sleep(60)
                    continue
                else:
                    point_id_set = set()
                    for rows_point in rows_points:
                        # valid point id in excel file
                        point_id_set.add(rows_point[0])

                    for energy_data_item in energy_data_list:
                        if energy_data_item['point_id'] not in point_id_set:
                            is_valid_file = False
                            break

                        for rows_point in rows_points:
                            if rows_point[0] == energy_data_item['point_id']:
                                if rows_point[2] > energy_data_item['actual_value']:
                                    is_valid_file = False
                                    break
                                elif rows_point[3] < energy_data_item['actual_value']:
                                    is_valid_file = False
                                    break
                            

                if is_valid_file:
                    ####################################################################################################
                    # delete possibly exists energy value data in myems energy database,
                    # and then insert new repair data
                    ####################################################################################################
                    try:
                        cnx = mysql.connector.connect(**config.myems_historical_db)
                        cursor = cnx.cursor()
                    except Exception as e:
                        logger.error("Error in step 3.2 of datarepair.calculate_hourly " + str(e))
                        if cursor:
                            cursor.close()
                        if cnx:
                            cnx.close()
                        time.sleep(60)
                        continue

                    try:
                        
                        data_time_utc_list = list()
                        for i in range(len(energy_data_list)):
                            for item in (energy_data_list[i]['date_time_utc'],):
                                data_time_utc_list.append(item)

                        start_time = min(data_time_utc_list)
                        end_time = max(data_time_utc_list)
                        point_id = energy_data_list[0]['point_id']
                        print("deleted data from %s to %s in table myems_historical_db.tbl_energy_value", start_time, end_time)
                        cursor.execute(" DELETE FROM tbl_energy_value "
                                       " WHERE point_id = %s "
                                       "       AND utc_date_time >= %s "
                                       "       AND utc_date_time <= %s ",
                                        (str(point_id),
                                        start_time.isoformat()[0:19],
                                        end_time.isoformat()[0:19]))
                        cnx.commit()

                        for energy_data_item in energy_data_list:       
                            
                            add_values = (" INSERT INTO tbl_energy_value "
                                          "             (point_id, utc_date_time, actual_value, is_bad) "
                                          " VALUES  ")

                            add_values += " (" + str(point_id) + ","
                            add_values += "'" + energy_data_item['date_time_utc'].isoformat()[0:19] + "',"
                            add_values += "'" + str(energy_data_item['actual_value']) + "',"
                            add_values += "0" + "), "
                                
        
                            print("add_values:" + add_values)
                            cursor.execute(add_values[:-2])
                            cnx.commit()

                    except Exception as e:
                        logger.error("Error in step 3.3 of datarepair.calculate_hourly " + str(e))
                        time.sleep(60)
                        continue
                    finally:
                        if cursor:
                            cursor.close()
                        if cnx:
                            cnx.close()

            ############################################################################################################
            # STEP 4: update file status to 'done' or 'error'
            ############################################################################################################
            print("to update data repair file status to done...")
            try:
                cnx = mysql.connector.connect(**config.myems_historical_db)
                cursor = cnx.cursor()
            except Exception as e:
                logger.error("Error in step 4.1 of offlinemeter.calculate_hourly " + str(e))
                if cursor:
                    cursor.close()
                if cnx:
                    cnx.close()
                time.sleep(60)
                continue

            try:
                update_row = (" UPDATE tbl_data_repair_files "
                              " SET status = %s "
                              " WHERE id = %s ")
                cursor.execute(update_row, ('done' if is_valid_file else 'error', excel_file['id'],))
                cnx.commit()
            except Exception as e:
                logger.error("Error in step 4.2 of datarepair.calculate_hourly " + str(e))
                time.sleep(60)
                continue
            finally:
                if cursor:
                    cursor.close()
                if cnx:
                    cnx.close()

        # end of for excel_file in excel_file_list

        print("go to sleep ...")
        time.sleep(300)
        print("wake from sleep, and go to work...")
    # end of outer while


def is_Vaild_Date(date):
    try:
        if ":" in date:
            time.strptime(date, "%Y-%m-%d %H:%M:%S")
        else:
            time.strptime(date, "%Y-%m-%d")
        return True
    except:
        return False