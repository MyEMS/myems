"""
MyEMS Cleaning Service - Energy Values Cleaning Module

This module handles the cleaning and quality control of energy values (cumulative energy consumption
data like kWh readings from meters) in the historical database. Unlike analog and digital values,
energy values are never deleted but are instead marked as "bad" when they fail quality checks.

The cleaning process identifies and tags bad energy values using multiple detection algorithms:

1. **Step 1**: Determine the time slot to clean based on existing processed data
2. **Step 2**: Check for bad values using high/low limit validation (Class 1 errors)
3. **Step 3**: Check for bad values using concave shape detection (Class 2 errors)
4. **Step 4**: Tag remaining unchecked values as good (is_bad = 0)

Class 1 errors include:
- Values exceeding configured high/low limits
- Extreme values (very large numbers, negative values, zero values)
- Values that are clearly outside normal operating ranges

Class 2 errors include:
- Concave shape patterns where energy values decrease unexpectedly
- Sudden drops in cumulative energy readings that violate monotonic behavior
- Values that create unrealistic energy consumption patterns

This process runs continuously to maintain data quality for billing and analysis purposes.
"""

import time
from datetime import datetime, timedelta, timezone

import mysql.connector

import config


########################################################################################################################
# Energy Values Quality Control Process
#
# This procedure will find and tag bad energy values using multiple detection algorithms:
#
# Step 1: Get the time slot to clean based on existing processed data
# Step 2: Check bad case class 1 with high limits and low limits validation
# Step 3: Check bad case class 2 which uses concave shape model detection
# Step 4: Tag the is_bad property of energy values (mark remaining as good)
########################################################################################################################

def process(logger):
    """
    Main process function for energy values quality control.

    This function runs continuously to identify and tag bad energy values using multiple
    detection algorithms. It processes energy data in time slots to ensure comprehensive
    quality control while maintaining system performance.

    Args:
        logger: Logger instance for recording process activities and errors
    """
    while True:
        # The outermost loop to reconnect to database server if there is a connection error
        cnx_historical = None
        cursor_historical = None

        # Establish connection to historical database
        try:
            cnx_historical = mysql.connector.connect(**config.myems_historical_db)
            cursor_historical = cnx_historical.cursor()
        except Exception as e:
            logger.error("Error at the begin of clean_energy_value.process " + str(e))
            # Clean up database connections in case of error
            if cursor_historical:
                cursor_historical.close()
            if cnx_historical:
                cnx_historical.close()
            time.sleep(60)  # Wait before retrying connection
            continue

        # Data Quality Control Notes:
        # The default value of unchecked values' is_bad property is NULL
        # If a value is checked and the result is bad then is_bad would be set to 1
        # Else if a value is checked and the result is good then is_bad would be set to 0

        ################################################################################################################
        # Step 1: Get the time slot to clean based on existing processed data
        ################################################################################################################

        min_datetime = None
        max_datetime = None

        try:
            # Find the latest processed energy value to determine where to continue cleaning
            # This ensures we don't reprocess already checked data
            query = (" SELECT MAX(utc_date_time) "
                     " FROM tbl_energy_value "
                     " WHERE is_bad IS NOT NULL ")
            cursor_historical.execute(query, ())
            row_datetime = cursor_historical.fetchone()

            if row_datetime is not None and len(row_datetime) == 1 and isinstance(row_datetime[0], datetime):
                # Start one hour before the last processed value to avoid omission mistakes
                # This ensures we don't miss any values due to timing issues
                min_datetime = row_datetime[0] - timedelta(hours=1)
            else:
                # All is_bad properties are null - this is the first run
                # Use the configured start datetime from configuration
                min_datetime = datetime.strptime(config.start_datetime_utc,
                                                 '%Y-%m-%d %H:%M:%S').replace(tzinfo=timezone.utc)

            # Find the latest unprocessed energy value to determine the end of cleaning range
            query = (" SELECT MAX(utc_date_time) "
                     " FROM tbl_energy_value "
                     " WHERE is_bad IS NULL ")
            cursor_historical.execute(query, ())
            row_datetime = cursor_historical.fetchone()

            if row_datetime is not None and len(row_datetime) == 1 and isinstance(row_datetime[0], datetime):
                max_datetime = row_datetime[0]

        except Exception as e:
            print("Error in Step 1 of clean_energy_value.process " + str(e))
            logger.error("Error in Step 1 of clean_energy_value.process " + str(e))
            # Clean up database connections in case of error
            if cursor_historical:
                cursor_historical.close()
            if cnx_historical:
                cnx_historical.close()
            time.sleep(60)
            continue

        # Validate that we have valid datetime range for processing
        if min_datetime is None or max_datetime is None:
            print("min_datetime or max_datetime is None")
            # Clean up database connections
            if cursor_historical:
                cursor_historical.close()
            if cnx_historical:
                cnx_historical.close()
            time.sleep(60)
            continue
        else:
            # Log the processing time range for monitoring
            print("min_datetime: " + min_datetime.isoformat()[0:19])
            print("max_datetime: " + max_datetime.isoformat()[0:19])

        ################################################################################################################
        # Step 2: Check bad case class 1 with high limits and low limits validation
        #
        # This step identifies energy values that exceed configured high/low limits or show
        # clearly abnormal patterns like extreme values, negative readings, or zero values.
        # These are obvious data quality issues that need to be flagged.
        ################################################################################################################

        ################################################################################################################
        # bad case 1.1
        # id          point_id utc_date_time        actual_value          is_bad (expected)
        # 104814811	  3333     2018-01-31 16:45:04	115603.0078125        good
        # 104814588	  3333     2018-01-31 16:44:00	115603.0078125        good
        # 104815007	  3333     2018-01-31 16:46:09	1.832278249396618e21  bad
        # 104815226	  3333     2018-01-31 16:47:13	1.832278249396618e21  bad
        # 104815423	  3333     2018-01-31 16:48:17	1.832278249396618e21  bad
        # 104815643	  3333     2018-01-31 16:49:22	1.832278249396618e21  bad
        # 104815820	  3333     2018-01-31 16:50:26	1.832278249396618e21  bad
        # 104816012	  3333     2018-01-31 16:51:30	1.832278249396618e21  bad
        # 104816252	  3333     2018-01-31 16:52:34	1.832278249396618e21  bad
        # 104816446	  3333     2018-01-31 16:53:38	1.832278249396618e21  bad
        # 104816667	  3333     2018-01-31 16:54:43	1.832278249396618e21  bad
        # 104816860	  3333     2018-01-31 16:55:47	1.832278249396618e21  bad
        # 104817065	  3333     2018-01-31 16:56:51	1.832278249396618e21  bad
        # 104817284	  3333     2018-01-31 16:57:55	1.832278249396618e21  bad
        # 104817482	  3333     2018-01-31 16:58:59	1.832278249396618e21  bad
        # 104817723	  3333     2018-01-31 17:00:04	1.832278249396618e21  bad
        # 104817940	  3333     2018-01-31 17:01:08	115749.0078125        good
        # 104818142	  3333     2018-01-31 17:02:11	115749.0078125        good
        # 104818380	  3333     2018-01-31 17:03:16	115749.0078125        good
        # 104818596	  3333     2018-01-31 17:04:20	115749.0078125        good
        ################################################################################################################

        ################################################################################################################
        # bad case 1.2:
        # id    point_id  utc_date_time          actual_value           is_bad (expected)
        #       3333      2018-01-31 17:27:53    115823.0078125         good
        #       3333      2018-01-31 17:28:57    115823.0078125         good
        #       3333      2018-01-31 17:30:02    115823.0078125         good
        #       3333      2018-01-31 17:31:06    115823.0078125         good
        #       3333      2018-01-31 17:32:11    0                      bad
        #       3333      2018-01-31 17:33:15    0                      bad
        #       3333      2018-01-31 17:34:19    0                      bad
        #       3333      2018-01-31 17:35:24    0                      bad
        #       3333      2018-01-31 17:36:28    0                      bad
        #       3333      2018-01-31 17:37:32    0                      bad
        #       3333      2018-01-31 17:38:36    0                      bad
        #       3333      2018-01-31 17:39:41    0                      bad
        #       3333      2018-01-31 17:40:44    0                      bad
        #       3333      2018-01-31 17:41:49    0                      bad
        #       3333      2018-01-31 17:43:57    0                      bad
        #       3333      2018-01-31 17:42:53    0                      bad
        #       3333      2018-01-31 17:45:01    0                      bad
        #       3333      2018-01-31 17:46:06    0                      bad
        #       3333      2018-01-31 17:47:10    0                      bad
        #       3333      2018-01-31 17:48:14    115969.0078125         good
        #       3333      2018-01-31 17:49:18    115969.0078125         good
        #       3333      2018-01-31 17:50:22    115969.0078125         good
        ################################################################################################################

        ################################################################################################################
        # bad case 1.3:
        # id    point_id  utc_date_time          actual_value           is_bad (expected)
        #       3333      2018-02-04 07:00:38    139968                  good
        #       3333      2018-02-04 07:01:42    139968                  good
        #       3333      2018-02-04 07:03:54    -7.068193740872921e-3   bad
        #       3333      2018-02-04 07:04:58    -7.068193740872921e-3   bad
        #       3333      2018-02-04 07:06:03    -7.068193740872921e-3   bad
        #       3333      2018-02-04 07:07:06    -7.068193740872921e-3   bad
        #       3333      2018-02-04 07:08:10    -7.068193740872921e-3   bad
        #       3333      2018-02-04 07:09:13    -7.068193740872921e-3   bad
        #       3333      2018-02-04 07:10:17    -7.068193740872921e-3   bad
        #       3333      2018-02-04 07:11:21    -7.068193740872921e-3   bad
        #       3333      2018-02-04 07:12:25    -7.068193740872921e-3   bad
        #       3333      2018-02-04 07:13:29    -7.068193740872921e-3   bad
        #       3333      2018-02-04 07:14:33    -7.068193740872921e-3   bad
        #       3333      2018-02-04 07:15:37    -7.068193740872921e-3   bad
        #       3333      2018-02-04 07:16:41    -7.068193740872921e-3   bad
        #       3333      2018-02-04 07:17:45    140114                  good
        #       3333      2018-02-04 07:18:49    140114                  good
        #       3333      2018-02-04 07:19:53    140114                  good
        ################################################################################################################

        ################################################################################################################
        # bad case 1.4:
        # id    point_id  utc_date_time          actual_value           is_bad (expected)
        #       3333      2018-02-08 01:16:38    165746.015625          good
        #       3333      2018-02-08 01:15:34    165746.015625          good
        #       3333      2018-02-08 01:14:30    165746.015625          good
        #       3333      2018-02-08 01:13:27    0.00303281145170331    bad
        #       3333      2018-02-08 01:12:22    0.00303281145170331    bad
        #       3333      2018-02-08 01:11:19    0.00303281145170331    bad
        #       3333      2018-02-08 01:10:15    0.00303281145170331    bad
        #       3333      2018-02-08 01:09:11    0.00303281145170331    bad
        #       3333      2018-02-08 01:08:06    0.00303281145170331    bad
        #       3333      2018-02-08 01:07:02    0.00303281145170331    bad
        #       3333      2018-02-08 01:05:58    0.00303281145170331    bad
        #       3333      2018-02-08 01:04:54    0.00303281145170331    bad
        #       3333      2018-02-08 01:03:50    0.00303281145170331    bad
        #       3333      2018-02-08 01:02:46    0.00303281145170331    bad
        #       3333      2018-02-08 01:01:42    0.00303281145170331    bad
        #       3333      2018-02-08 01:00:39    0.00303281145170331    bad
        #       3333      2018-02-08 00:59:34    0.00303281145170331    bad
        #       3333      2018-02-08 00:58:31    0.00303281145170331    bad
        #       3333      2018-02-08 00:57:27    165599.015625          good
        #       3333      2018-02-08 00:56:23    165599.015625          good
        #       3333      2018-02-08 00:55:20    165599.015625          good
        #       3333      2018-02-08 00:54:16    165599.015625          good
        ################################################################################################################
        print("Step 2: Processing bad case 1.x - High/Low limit validation")

        # Connect to system database to get point configuration (high/low limits)
        cnx_system = None
        cursor_system = None
        point_dict = dict()

        try:
            cnx_system = mysql.connector.connect(**config.myems_system_db)
            cursor_system = cnx_system.cursor()

            # Get high and low limits for all energy value points
            query = (" SELECT id, high_limit, low_limit "
                     " FROM tbl_points "
                     " WHERE object_type='ENERGY_VALUE'")
            cursor_system.execute(query)
            rows_points = cursor_system.fetchall()

            # Build dictionary of point limits for quick lookup
            if rows_points is not None and len(rows_points) > 0:
                for row in rows_points:
                    point_dict[row[0]] = {"high_limit": row[1],
                                          "low_limit": row[2]}
        except Exception as e:
            logger.error("Error in step 2.1 of clean_energy_value.process " + str(e))
            time.sleep(60)
            continue
        finally:
            # Always clean up system database connections
            if cursor_system:
                cursor_system.close()
            if cnx_system:
                cnx_system.close()

        # Get energy values in the processing time range that haven't been marked as bad
        try:
            query = (" SELECT id, point_id, actual_value "
                     " FROM tbl_energy_value "
                     " WHERE utc_date_time >= %s AND utc_date_time <= %s AND (is_bad = 0 OR is_bad IS NULL) ")
            cursor_historical.execute(query, (min_datetime, max_datetime,))
            rows_energy_values = cursor_historical.fetchall()
        except Exception as e:
            logger.error("Error in step 2.2 of clean_energy_value.process " + str(e))
            if cursor_historical:
                cursor_historical.close()
            if cnx_historical:
                cnx_historical.close()
            time.sleep(60)
            continue

        # Initialize list to collect IDs of bad energy values
        bad_list = list()

        # Check each energy value against its configured limits
        if rows_energy_values is not None and len(rows_energy_values) > 0:
            for row_energy_value in rows_energy_values:
                point_id = row_energy_value[1]
                actual_value = row_energy_value[2]
                point = point_dict.get(point_id, None)

                # Mark as bad if:
                # 1. Point configuration not found (point_dict.get returns None)
                # 2. Value exceeds high limit
                # 3. Value is below low limit
                if point is None or actual_value > point['high_limit'] or actual_value < point['low_limit']:
                    bad_list.append(row_energy_value[0])

        print('bad list: ' + str(bad_list))

        # Update bad values in batches of 100 to avoid overwhelming the database
        while len(bad_list) > 0:
            update_100 = bad_list[:100]  # Take first 100 items
            bad_list = bad_list[100:]    # Remove processed items from list

            try:
                # Mark the identified values as bad (is_bad = 1)
                update = (" UPDATE tbl_energy_value "
                          " SET is_bad = 1 "
                          " WHERE id IN (" + ', '.join(map(str, update_100)) + ")")
                cursor_historical.execute(update, )
                cnx_historical.commit()
            except Exception as e:
                logger.error("Error in step 2.3 of clean_energy_value.process " + str(e))
                if cursor_historical:
                    cursor_historical.close()
                if cnx_historical:
                    cnx_historical.close()
                time.sleep(60)
                continue

        ################################################################################################################
        # Step 3: Check bad case class 2 which uses concave shape model detection
        #
        # This step identifies energy values that create concave patterns in the time series.
        # Energy values should generally be monotonically increasing (cumulative), so sudden
        # decreases or concave patterns indicate data quality issues like meter resets,
        # communication errors, or sensor malfunctions.
        ################################################################################################################
        print("Step 3: Processing bad case 2.x - Concave shape detection")
        ################################################################################################################
        # bad case 2.1
        # id    point_id  utc_date_time          actual_value       is_bad (expected)
        #       3333      2018-02-05 04:55:45    146129.015         good
        #       3333      2018-02-05 04:56:49    146129.015         good
        #       3333      2018-02-05 04:57:54    146129.015         good
        #       3333      2018-02-05 05:22:52    145693.015         bad
        #       3333      2018-02-05 05:25:01    146274             good
        #       3333      2018-02-05 05:26:03    146274             good
        #       3333      2018-02-05 05:27:05    146274             good
        #       3333      2018-02-05 05:29:30    146274             good
        ################################################################################################################

        ################################################################################################################
        # bad case 2.2
        # id    point_id	utc_date_time	    actual_value	is_bad (expected)
        #       3321	    2018-05-15 15:09:54	33934040         good
        #       3321	    2018-05-15 15:08:51	33934040         good
        #       3321	    2018-05-15 15:07:47	33934040         good
        #       3321	    2018-05-15 15:06:44	33934040         good
        #       3321	    2018-05-15 15:05:40	33934040         good
        #       3321	    2018-05-15 15:04:36	33934040         good
        #       3321	    2018-05-15 09:09:00	33928880	     bad
        #       3321	    2018-05-15 09:05:23	33933568         good
        #       3321	    2018-05-15 09:04:20	33933568         good
        #       3321	    2018-05-15 09:03:16	33933568         good
        #       3321	    2018-05-15 09:02:13	33933560         good
        #       3321	    2018-05-15 09:01:09	33933560         good
        #       3321	    2018-05-15 09:00:04	33933560         good
        ################################################################################################################

        ################################################################################################################
        # bad case 2.3
        # id    point_id	utc_date_time	    actual_value	is_bad (expected)
        #       554	        2018-05-19 15:32:52	24001            good
        #       554	        2018-05-19 15:30:45	24001            good
        #       554	        2018-05-19 15:28:39	24001            good
        #       554	        2018-05-19 15:26:32	24001            good
        #       554	        2018-05-19 15:24:25	24001            good
        #       554	        2018-05-19 15:22:18	24001            good
        #       554	        2018-05-19 15:20:10	24001            good
        #       554	        2018-05-19 15:18:04	24001            good
        #       554	        2018-05-19 15:15:58	24001            good
        #       554	        2018-05-19 15:13:51	24001            good
        #       554	        2018-05-19 15:11:43	24001            good
        #       554	        2018-05-19 15:09:37	24001            good
        #       554	        2018-05-19 15:07:29	24000            good
        #       554	        2018-05-19 15:05:22	23000	         bad
        #       554	        2018-05-19 15:03:14	23999            good
        #       554	        2018-05-19 15:01:06	23999            good
        #       554	        2018-05-19 14:58:59	23999            good
        #       554	        2018-05-19 14:56:52	23998            good
        #       554	        2018-05-19 14:54:45	23998            good
        #       554	        2018-05-19 14:52:39	23998            good
        ################################################################################################################
        # todo bad case 2.3.1
        # "id", "point_id", "utc_date_time", "actual_value", "is_bad" (actual)
        # 68504700, 2, "2021-01-09 03:40:12.0", 40454414.063, 0
        # 68507243, 2, "2021-01-09 03:43:12.0", 40454476.563, 0
        # 68510030, 2, "2021-01-09 03:47:17.0", 40428074.219, 0 ?
        # 68512573, 2, "2021-01-09 03:50:18.0", 40454621.094, 0
        # 68515421, 2, "2021-01-09 03:54:23.0", 40454703.125, 0
        # 68517964, 2, "2021-01-09 03:57:23.0", 40454761.719, 0

        ################################################################################################################
        # bad case 2.4
        # id       point_id utc_date_time          actual_value    is_bad (expected)
        # 104373141 3336    2018-01-30 03:04:12    216463.015625   good
        # 104373337 3336    2018-01-30 03:05:15    216463.015625   good
        # 104373555 3336    2018-01-30 03:06:20    216463.015625   good
        # 104373750 3336    2018-01-30 03:07:25    192368.015625   bad
        # 104373957 3336    2018-01-30 03:08:29    192368.015625   bad
        # 104374175 3336    2018-01-30 03:09:33    192368.015625   bad
        # 104374382 3336    2018-01-30 03:10:38    192368.015625   bad
        # 104374604 3336    2018-01-30 03:11:42    192368.015625   bad
        # 104374792 3336    2018-01-30 03:12:47    192368.015625   bad
        # 104375010 3336    2018-01-30 03:13:51    192368.015625   bad
        # 104375200 3336    2018-01-30 03:14:55    192368.015625   bad
        # 104375418 3336    2018-01-30 03:16:00    192368.015625   bad
        # 104375617 3336    2018-01-30 03:17:04    192368.015625   bad
        # 104375837 3336    2018-01-30 03:18:08    192368.015625   bad
        # 104376023 3336    2018-01-30 03:19:12    192368.015625   bad
        # 104376216 3336    2018-01-30 03:20:16    192368.015625   bad
        # 104376435 3336    2018-01-30 03:21:21    192368.015625   bad
        # 104376634 3336    2018-01-30 03:22:25    192368.015625   bad
        # 104376853 3336    2018-01-30 03:23:30    192368.015625   bad
        # 104377071 3336    2018-01-30 03:24:34    192368.015625   bad
        # 104377274 3336    2018-01-30 03:25:38    192368.015625   bad
        # 104377501 3336    2018-01-30 03:26:42    216574.015625   good
        # 104377714 3336    2018-01-30 03:27:47    216574.015625   good
        ################################################################################################################

        ################################################################################################################
        # bad case 2.5
        # id       point_id utc_date_time          actual_value  is_bad (expected)
        # 104370839 3334    2018-01-30 02:52:23    844966.0625   good
        # 104371064 3334    2018-01-30 02:53:27    844966.0625   good
        # 104371261 3334    2018-01-30 02:54:32    844966.0625   good
        # 104371479 3334    2018-01-30 02:55:36    826142.0625   bad
        # 104371672 3334    2018-01-30 02:56:41    826142.0625   bad
        # 104371884 3334    2018-01-30 02:57:45    826142.0625   bad
        # 104372110 3334    2018-01-30 02:58:49    826142.0625   bad
        # 104372278 3334    2018-01-30 02:59:54    845019.0625   good
        # 104372512 3334    2018-01-30 03:00:58    845019.0625   good
        # 104372704 3334    2018-01-30 03:02:03    845019.0625   good
        ################################################################################################################

        ################################################################################################################
        # bad case 2.6
        # 394084273	1001444	2019-08-22 03:39:44	   38969028      good
        # 394083709	1001444	2019-08-22 03:38:43    38968876	     good
        # 394083145	1001444	2019-08-22 03:37:43    28371884      bad
        # 394082019	1001444	2019-08-22 03:35:42    28371884      bad
        # 394081456	1001444	2019-08-22 03:34:42    28371884      bad
        # 394080892	1001444	2019-08-22 03:33:42    28371884      bad
        # 394079200	1001444	2019-08-22 03:30:38    28371884      bad
        # 394077511	1001444	2019-08-22 03:27:37    38968408	     good
        # 394076947	1001444	2019-08-22 03:26:37    38968236	     good
        # 394076384	1001444	2019-08-22 03:25:37    38968060	     good
        ################################################################################################################

        ################################################################################################################
        # bad case 2.7
        # id       point_id utc_date_time          actual_value   is_bad (expected)
        # 17303260 11       2020-3-15 05:43:52     33600          good
        # 17303399 11       2020-3-15 05:44:58     33600          good
        # 17303538 11       2020-3-15 05:46:04     33600          good
        # 17303677 11       2020-3-15 05:47:10     33500          bad
        # 17303816 11       2020-3-15 05:48:15     33500          bad
        # 17303955 11       2020-3-15 05:49:21     33600          good
        # 17304094 11       2020-3-15 05:50:27     33600          good
        # 17304233 11       2020-3-15 05:51:33     33600          good
        ################################################################################################################

        # Get energy values in the processing time range that haven't been marked as bad
        # Order by point_id and utc_date_time to process each point's time series sequentially
        try:
            query = (" SELECT point_id, id, utc_date_time, actual_value "
                     " FROM tbl_energy_value "
                     " WHERE utc_date_time >= %s AND utc_date_time <= %s AND (is_bad = 0 OR is_bad IS NULL) "
                     " ORDER BY point_id, utc_date_time ")
            cursor_historical.execute(query, (min_datetime, max_datetime,))
            rows_energy_values = cursor_historical.fetchall()
        except Exception as e:
            logger.error("Error in step 3.1 of clean_energy_value.process " + str(e))
            if cursor_historical:
                cursor_historical.close()
            if cnx_historical:
                cnx_historical.close()
            time.sleep(60)
            continue

        # Group energy values by point_id for time series analysis
        point_value_dict = dict()
        current_point_value_list = list()
        current_point_id = 0

        if rows_energy_values is not None and len(rows_energy_values) > 0:
            for row_energy_value in rows_energy_values:
                previous_point_id = current_point_id
                current_point_id = row_energy_value[0]  # point_id

                if current_point_id not in point_value_dict.keys():
                    # New point id found - save previous point's values
                    if len(current_point_value_list) > 0:
                        point_value_dict[previous_point_id] = current_point_value_list
                        current_point_value_list = list()

                    # Add current value to the new point's list
                    current_point_value_list.append({'id': row_energy_value[1],
                                                     'actual_value': row_energy_value[3]})
                else:
                    # Same point - add to current point's list
                    current_point_value_list.append({'id': row_energy_value[1],
                                                     'actual_value': row_energy_value[3]})

            # Save the last point's values
            if len(current_point_value_list) > 0:
                point_value_dict[current_point_id] = current_point_value_list

        # Reinitialize bad list for concave shape detection results
        bad_list = list()

        # Analyze each point's time series for concave patterns
        for point_id, point_value_list in point_value_dict.items():
            if len(point_value_list) <= 1:
                # Need at least 2 values to detect concave patterns
                continue
            elif len(point_value_list) == 2:
                # Simple case: if second value is less than first, mark as bad
                if point_value_list[1]['actual_value'] < point_value_list[0]['actual_value']:
                    bad_list.append(point_value_list[1]['id'])
                continue
            else:
                # Complex case: detect concave patterns in longer time series
                base_point_value = point_value_list[0]['actual_value']
                concave_point_value_list = list()

                for i in range(len(point_value_list)):
                    if point_value_list[i]['actual_value'] < base_point_value:
                        # Candidate concave value found (value is lower than base)
                        concave_point_value_list.append(point_value_list[i]['id'])
                    else:
                        # Normal value found (value is higher than or equal to base)
                        if len(concave_point_value_list) > 0:
                            # Save confirmed concave values to bad list
                            bad_list.extend(concave_point_value_list)

                        # Prepare for next candidate concave value list
                        base_point_value = point_value_list[i]['actual_value']
                        concave_point_value_list.clear()
                continue

        print('bad list: ' + str(bad_list))

        # Update bad values in batches of 100 to avoid overwhelming the database
        while len(bad_list) > 0:
            update_100 = bad_list[:100]  # Take first 100 items
            bad_list = bad_list[100:]    # Remove processed items from list

            try:
                # Mark the identified concave values as bad (is_bad = 1)
                update = (" UPDATE tbl_energy_value "
                          " SET is_bad = 1 "
                          " WHERE id IN (" + ', '.join(map(str, update_100)) + ")")
                cursor_historical.execute(update, )
                cnx_historical.commit()
            except Exception as e:
                logger.error("Error in step 3.2 of clean_energy_value.process " + str(e))
                if cursor_historical:
                    cursor_historical.close()
                if cnx_historical:
                    cnx_historical.close()
                time.sleep(60)
                continue

        ################################################################################################################
        # TODO: bad case 2.8
        # id          point_id utc_date_time          actual_value is_bad (expected)
        # 105752070    3333    2018-02-04 00:27:15    138144       good
        # 105752305    3333    2018-02-04 00:28:19    138144       good
        # 105752523    3333    2018-02-04 00:29:22    138144       good
        # 105752704    3333    2018-02-04 00:30:26    138144       good
        # 105752924    3333    2018-02-04 00:31:30    138144       good
        # 105753138    3333    2018-02-04 00:32:34    138144       good
        # 105753351    3333    2018-02-04 00:33:38    138144       good
        # 105753577    3333    2018-02-04 00:34:42    52776558592  bad?
        # 105753794    3333    2018-02-04 00:35:46    52776558592  bad?
        # 105753999    3333    2018-02-04 00:36:50    52776558592  bad?
        # 105754231    3333    2018-02-04 00:37:54    52776558592  bad?
        # 105754443    3333    2018-02-04 00:38:58    52776558592  bad?
        # 105754655    3333    2018-02-04 00:40:01    52776558592  bad?
        # 105754878    3333    2018-02-04 00:41:06    52776558592  bad?
        # 105755092    3333    2018-02-04 00:42:09    52776558592  bad?
        # 105755273    3333    2018-02-04 00:43:14    52776558592  bad?
        # 105755495    3333    2018-02-04 00:44:17    52776558592  bad?
        # 105755655    3333    2018-02-04 00:45:21    52776558592  bad?
        # 105755854    3333    2018-02-04 00:46:25    52776558592  bad?
        # 105756073    3333    2018-02-04 00:47:29    52776558592  bad?
        # 105756272    3333    2018-02-04 00:48:34    52776558592  bad?
        # 105756489    3333    2018-02-04 00:49:38    52776558592  bad?
        ################################################################################################################

        ################################################################################################################
        # TODO: bad case 2.10
        # id       point_id utc_date_time          actual_value   is_bad (expected)
        # 106363135 3336    2018-02-06 04:45:57    253079.015625  good
        # 106363776 3336    2018-02-06 04:49:09    253079.015625  good
        # 106364381 3336    2018-02-06 04:52:21    253079.015625  good
        # 106364603 3336    2018-02-06 04:53:25    253079.015625  good
        # 106365213 3336    2018-02-06 04:56:37    253079.015625  good
        # 106365634 3336    2018-02-06 04:58:45    253079.015625  good
        # 106366055 3336    2018-02-06 05:00:53    253079.015625  good
        # 106367097 3336    2018-02-06 05:06:12    259783.015625  bad?
        # 106367507 3336    2018-02-06 05:08:21    259783.015625  bad?
        # 106368318 3336    2018-02-06 05:12:37    259783.015625  bad?
        # 106368732 3336    2018-02-06 05:14:44    259783.015625  bad?
        # 106368952 3336    2018-02-06 05:15:48    259783.015625  bad?
        # 106369145 3336    2018-02-06 05:16:52    259783.015625  bad?
        # 106369353 3336    2018-02-06 05:17:56    259783.015625  bad?
        ################################################################################################################

        ################################################################################################################
        # TODO: bad case 2.11
        # id       point_id utc_date_time          actual_value   is_bad (expected)
        # 14784589 21	    2020-03-05 07:22:22    17990           good
        # 14784450 21	    2020-03-05 07:21:17    17990           good
        # 14784311 21	    2020-03-05 07:20:10    17990           good
        # 14784172 21	    2020-03-05 07:19:04    17990           good
        # 14784033 21	    2020-03-05 07:17:58    18990           bad
        # 14783894 21	    2020-03-05 07:16:52    17990           good
        # 14783755 21	    2020-03-05 07:15:46    17990           good
        # 14783616 21	    2020-03-05 07:14:40    17990           good
        # 14783477 21	    2020-03-05 07:13:34    17990           good
        # 14783338 21	    2020-03-05 07:12:28    17990           good
        # 14783199 21	    2020-03-05 07:11:22    17990           good
        ################################################################################################################

        ################################################################################################################
        # TODO: bad case 2.12
        # id       point_id utc_date_time          actual_value   is_bad (expected)
        # 3337308  21       2020-01-07 09:02:18    7990           good
        # 3337174  21       2020-01-07 09:01:13    7990	          good
        # 3337040  21       2020-01-07 09:00:08    7990	          good
        # 3336906  21       2020-01-07 08:59:04    7990	          good
        # 3336772  21       2020-01-07 08:57:59    7990	          good
        # 3336638  21       2020-01-07 08:56:54    8990	          bad
        # 3336504  21       2020-01-07 08:55:49    7990	          good
        # 3336370  21       2020-01-07 08:54:44    7990	          good
        # 3336236  21       2020-01-07 08:53:39    7990	          good
        # 3336102  21       2020-01-07 08:52:34    7990	          good
        # 3335968  21       2020-01-07 08:51:30    7990	          good
        ################################################################################################################
        # Step 4: Tag the is_bad property of energy values (mark remaining as good)
        #
        # After running all quality control checks, mark any remaining unchecked values
        # (is_bad IS NULL) as good (is_bad = 0). This ensures all values in the processing
        # time range have been evaluated and tagged appropriately.
        ################################################################################################################
        try:
            # Mark all remaining unchecked values as good
            update = (" UPDATE tbl_energy_value "
                      " SET is_bad = 0 "
                      " WHERE utc_date_time >= %s AND utc_date_time < %s AND is_bad IS NULL ")
            # NOTE: Use '<' instead of '<=' in WHERE statement because there may be some new inserted values
            # during processing that we don't want to affect
            cursor_historical.execute(update, (min_datetime, max_datetime,))
            cnx_historical.commit()
        except Exception as e:
            logger.error("Error in step 4 of clean_energy_value.process " + str(e))
            time.sleep(60)
            continue
        finally:
            # Always clean up database connections
            if cursor_historical:
                cursor_historical.close()
            if cnx_historical:
                cnx_historical.close()

        # Wait 15 minutes (900 seconds) before starting the next cleaning cycle
        # This prevents the process from running too frequently and overwhelming the database
        time.sleep(900)
