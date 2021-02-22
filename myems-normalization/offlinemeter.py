import time
from datetime import datetime, timedelta
import mysql.connector
from openpyxl import load_workbook
import config

################################################################################################################
# PROCEDURES:
# STEP 1: get all 'new' offline meter files
# STEP 2: for each new files, iterate all rows and read cell's value and store data to energy data list
# STEP 3: insert or update energy data to table offline meter hourly in energy database
# STEP 4: update file status to 'done' or 'error'
################################################################################################################


def calculate_hourly(logger):
    while True:
        # outer loop to reconnect server if there is a connection error
        ################################################################################################################
        # STEP 1: get all 'new' offline meter files
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

        print("Getting all new offline meter files")
        try:
            query = (" SELECT id, file_name, file_object "
                     " FROM tbl_offline_meter_files "
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
            print("read data from each offline meter file" + excel_file['name'])
            is_valid_file = True
            fw = None
            try:
                fw = open("myems-normalization.blob", 'wb')
                fw.write(excel_file['file_object'])
                fw.close()
            except Exception as e:
                logger.error("Error in step 2.1 of offline meter.calculate_hourly " + str(e))
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

                for row in ws.iter_rows(min_row=3, max_row=1024, min_col=1, max_col=34):
                    offline_meter_data = dict()
                    offline_meter_data['offline_meter_id'] = None
                    offline_meter_data['offline_meter_name'] = None
                    offline_meter_data['data'] = dict()
                    col_num = 0

                    for cell in row:
                        col_num += 1
                        print(cell.value)
                        if col_num == 1:
                            # get offline meter ID
                            if cell.value is not None:
                                offline_meter_data['offline_meter_id'] = cell.value
                            else:
                                break
                        elif col_num == 2:
                            # get offline meter name
                            if cell.value is None:
                                break
                            else:
                                offline_meter_data['offline_meter_name'] = cell.value
                        elif col_num > 3:
                            # get date of the cell
                            try:
                                offline_datetime = datetime(year=ws['A2'].value,
                                                            month=ws['B2'].value,
                                                            day=col_num - 3)
                            except ValueError:
                                # invalid date and go to next cell in this row until reach max_col
                                continue

                            offline_datetime_utc = offline_datetime - timedelta(minutes=timezone_offset)

                            if cell.value is None:
                                # if the cell is empty then stop at that day
                                break
                            else:
                                offline_meter_data['data'][offline_datetime_utc] = cell.value

                    if len(offline_meter_data['data']) > 0:
                        print("offline_meter_data:" + str(offline_meter_data))
                        energy_data_list.append(offline_meter_data)

            ############################################################################################################
            # STEP 3: insert or update energy data to table offline meter hourly in energy database
            ############################################################################################################
            print("to valid offline meter id in excel file...")
            if len(energy_data_list) == 0:
                print("Could not find any offline meters in the file...")
                print("and go to process the next file...")
                is_valid_file = False
            else:
                try:
                    cnx = mysql.connector.connect(**config.myems_system_db)
                    cursor = cnx.cursor()
                except Exception as e:
                    logger.error("Error in step 3.1 of offlinemeter.calculate_hourly " + str(e))
                    if cursor:
                        cursor.close()
                    if cnx:
                        cnx.close()
                    time.sleep(60)
                    continue

                try:
                    cursor.execute(" SELECT id, name "
                                   " FROM tbl_offline_meters ")
                    rows_offline_meters = cursor.fetchall()
                except Exception as e:
                    logger.error("Error in step 3.2 of offlinemeter.calculate_hourly " + str(e))
                    time.sleep(60)
                    continue
                finally:
                    if cursor:
                        cursor.close()
                    if cnx:
                        cnx.close()

                if rows_offline_meters is None or len(rows_offline_meters) == 0:
                    print("Could not find any offline meters in the MyEMS System Database...")
                    time.sleep(60)
                    continue
                else:
                    offline_meter_id_set = set()
                    for row_offline_meter in rows_offline_meters:
                        # valid offline meter id in excel file
                        offline_meter_id_set.add(row_offline_meter[0])

                    for energy_data_item in energy_data_list:
                        if energy_data_item['offline_meter_id'] not in offline_meter_id_set:
                            is_valid_file = False
                            break

                if is_valid_file:
                    ####################################################################################################
                    # delete possibly exists offline meter hourly data in myems energy database,
                    # and then insert new offline meter hourly data
                    ####################################################################################################
                    try:
                        cnx = mysql.connector.connect(**config.myems_energy_db)
                        cursor = cnx.cursor()
                    except Exception as e:
                        logger.error("Error in step 3.2 of offlinemeter.calculate_hourly " + str(e))
                        if cursor:
                            cursor.close()
                        if cnx:
                            cnx.close()
                        time.sleep(60)
                        continue

                    try:
                        for energy_data_item in energy_data_list:
                            offline_meter_id = energy_data_item['offline_meter_id']
                            print(energy_data_item['data'].items())
                            for k, v in energy_data_item['data'].items():
                                start_datetime_utc = k
                                end_datetime_utc = start_datetime_utc + timedelta(hours=24)
                                actual_value = v / (24 * 60 / config.minutes_to_count)
                                cursor.execute(" DELETE FROM tbl_offline_meter_hourly "
                                               " WHERE offline_meter_id = %s "
                                               "       AND start_datetime_utc >= %s "
                                               "       AND start_datetime_utc < %s ",
                                               (offline_meter_id,
                                                start_datetime_utc.isoformat()[0:19],
                                                end_datetime_utc.isoformat()[0:19]))
                                cnx.commit()
                                # todo: check with hourly low limit and hourly high limit
                                add_values = (" INSERT INTO tbl_offline_meter_hourly "
                                              "             (offline_meter_id, start_datetime_utc, actual_value) "
                                              " VALUES  ")

                                while start_datetime_utc < end_datetime_utc:
                                    add_values += " (" + str(offline_meter_id) + ","
                                    add_values += "'" + start_datetime_utc.isoformat()[0:19] + "',"
                                    add_values += str(actual_value) + "), "
                                    start_datetime_utc += timedelta(minutes=config.minutes_to_count)

                                print("add_values:" + add_values)
                                # trim ", " at the end of string and then execute
                                cursor.execute(add_values[:-2])
                                cnx.commit()
                    except Exception as e:
                        logger.error("Error in step 3.3 of offlinemeter.calculate_hourly " + str(e))
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
            print("to update offline meter file status to done...")
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
                update_row = (" UPDATE tbl_offline_meter_files "
                              " SET status = %s "
                              " WHERE id = %s ")
                cursor.execute(update_row, ('done' if is_valid_file else 'error', excel_file['id'],))
                cnx.commit()
            except Exception as e:
                logger.error("Error in step 4.2 of offlinemeter.calculate_hourly " + str(e))
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

