"""
Check if the API returns data correctly for meter realtime analysis.
"""
import mysql.connector

DB_HOST = '192.168.43.24'
DB_USER = 'root'
DB_PASSWORD = '030508'

# Check energy value data for point 1 (meter 1) and point 15 (meter 4)
db = mysql.connector.connect(
    host=DB_HOST, port=3306, user=DB_USER, password=DB_PASSWORD,
    database='myems_historical_db', connect_timeout=5
)
c = db.cursor()

for point_id in [1, 15]:
    c.execute(
        "SELECT point_id, utc_date_time, actual_value FROM tbl_energy_value "
        "WHERE point_id = %s ORDER BY utc_date_time DESC LIMIT 5",
        (point_id,)
    )
    rows = c.fetchall()
    print("Point %s latest data:" % point_id)
    for r in rows:
        print("  time=%s, value=%s" % (r[1], r[2]))
    print()

# Check if there's data within the last 60 minutes
from datetime import datetime, timezone, timedelta
now_utc = datetime.now(timezone.utc)
start = now_utc - timedelta(minutes=60)
print("Checking data within last 60 minutes (UTC):")
print("  Range: %s to %s" % (start, now_utc))

for point_id in [1, 15]:
    c.execute(
        "SELECT COUNT(*) FROM tbl_energy_value "
        "WHERE point_id = %s AND utc_date_time >= %s AND utc_date_time <= %s",
        (point_id, start, now_utc)
    )
    count = c.fetchone()[0]
    print("  Point %s: %s records in last 60 min" % (point_id, count))

db.close()
print("\nDone!")