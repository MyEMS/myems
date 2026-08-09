"""
Refresh test data for meter realtime analysis.
Delete old data and insert fresh data within the current 60-minute window.
"""
import mysql.connector
from datetime import datetime, timezone, timedelta

DB_HOST = '192.168.43.24'
DB_USER = 'root'
DB_PASSWORD = '030508'

now_utc = datetime.now(timezone.utc).replace(second=0, microsecond=0)
start = now_utc - timedelta(minutes=60)

print("Current UTC: %s" % now_utc)
print("Data range: %s to %s" % (start, now_utc))

# Connect to historical DB
db = mysql.connector.connect(
    host=DB_HOST, port=3306, user=DB_USER, password=DB_PASSWORD,
    database='myems_historical_db', connect_timeout=5
)
c = db.cursor()

# Delete old data for both points
for point_id in [1, 15]:
    c.execute("DELETE FROM tbl_energy_value WHERE point_id = %s", (point_id,))
    print("Deleted old data for point %s" % point_id)
db.commit()

# Insert fresh data for point 1 (Meter 1: mixed values with some zeros)
# Make sure the latest value is non-zero so the user can see it on the title
point_id = 1
i = 0
ts = start
while ts <= now_utc:
    minutes_ago = int((now_utc - ts).total_seconds() / 60)
    if minutes_ago <= 2:
        # Last 2 minutes: non-zero values to ensure title shows data
        val = 75
    elif i % 10 == 0 or i % 7 == 0:
        val = 0
    else:
        val = 50 + (i % 30)
    c.execute(
        "INSERT INTO tbl_energy_value (point_id, utc_date_time, actual_value, is_bad, is_published) "
        "VALUES (%s, %s, %s, 0, 1)",
        (point_id, ts, val)
    )
    i += 1
    ts = start + timedelta(minutes=i)

print("Inserted %s records for point %s (mixed values, some zeros)" % (i, point_id))

# Insert fresh data for point 15 (Meter 4: all zeros)
point_id = 15
i = 0
ts = start
while ts <= now_utc:
    c.execute(
        "INSERT INTO tbl_energy_value (point_id, utc_date_time, actual_value, is_bad, is_published) "
        "VALUES (%s, %s, %s, 0, 1)",
        (point_id, ts, 0)
    )
    i += 1
    ts = start + timedelta(minutes=i)

print("Inserted %s records for point %s (all zeros)" % (i, point_id))

db.commit()

# Verify
for point_id in [1, 15]:
    c.execute("SELECT COUNT(*) FROM tbl_energy_value WHERE point_id = %s", (point_id,))
    total = c.fetchone()[0]
    c.execute("SELECT COUNT(*) FROM tbl_energy_value WHERE point_id = %s AND actual_value = 0", (point_id,))
    zeros = c.fetchone()[0]
    c.execute("SELECT MAX(utc_date_time) FROM tbl_energy_value WHERE point_id = %s", (point_id,))
    latest = c.fetchone()[0]
    print("Point %s: total=%s, zeros=%s, latest=%s" % (point_id, total, zeros, latest))

db.close()
print("Done!")