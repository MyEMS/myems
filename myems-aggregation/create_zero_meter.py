"""
Create a test meter with all-zero data for meter realtime analysis.
"""
import mysql.connector
import uuid
from datetime import datetime, timezone, timedelta

DB_HOST = '192.168.43.24'
DB_USER = 'root'
DB_PASSWORD = '030508'

# Connect to system DB
db = mysql.connector.connect(
    host=DB_HOST, port=3306, user=DB_USER, password=DB_PASSWORD,
    database='myems_system_db', connect_timeout=5
)
c = db.cursor()

# Step 1: Check existing IDs
c.execute('SELECT MAX(id) FROM tbl_points')
max_point_id = c.fetchone()[0] or 14
c.execute('SELECT MAX(id) FROM tbl_meters')
max_meter_id = c.fetchone()[0] or 3

new_point_id = max_point_id + 1
new_meter_id = max_meter_id + 1

# Step 2: Create a new point (ENERGY_VALUE type)
point_uuid = str(uuid.uuid4())
c.execute(
    "INSERT INTO tbl_points (id, name, data_source_id, object_type, units, high_limit, low_limit, is_trend, is_virtual, address) "
    "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
    (new_point_id, 'Test Zero Meter Energy', 1, 'ENERGY_VALUE', 'kWh', 999999.0, 0.0, 1, 0, '{"address":"test"}')
)
print(f"Created point ID={new_point_id}")

# Step 3: Create a new meter
meter_uuid = str(uuid.uuid4())
c.execute(
    "INSERT INTO tbl_meters (id, name, uuid, energy_category_id, is_counted, hourly_low_limit, hourly_high_limit, cost_center_id) "
    "VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
    (new_meter_id, 'Test Zero Meter', meter_uuid, 1, 1, 0.0, 999999.0, 1)
)
print(f"Created meter ID={new_meter_id}")

# Step 4: Link meter to point
c.execute(
    "INSERT INTO tbl_meters_points (meter_id, point_id) VALUES (%s, %s)",
    (new_meter_id, new_point_id)
)
print(f"Linked meter {new_meter_id} -> point {new_point_id}")

# Step 5: Link meter to space (space_id=2)
c.execute(
    "INSERT INTO tbl_spaces_meters (space_id, meter_id) VALUES (%s, %s)",
    (2, new_meter_id)
)
print(f"Linked space 2 -> meter {new_meter_id}")

db.commit()
db.close()
print("System DB setup complete!")

# Step 6: Insert all-zero data into tbl_energy_value
db2 = mysql.connector.connect(
    host=DB_HOST, port=3306, user=DB_USER, password=DB_PASSWORD,
    database='myems_historical_db', connect_timeout=5
)
c2 = db2.cursor()

now_utc = datetime.now(timezone.utc)
start = now_utc - timedelta(minutes=60)
count = 0

i = 0
ts = start
while ts <= now_utc:
    c2.execute(
        "INSERT INTO tbl_energy_value (point_id, utc_date_time, actual_value, is_bad, is_published) "
        "VALUES (%s, %s, %s, 0, 1)",
        (new_point_id, ts.strftime('%Y-%m-%d %H:%M:%S'), 0)
    )
    count += 1
    i += 1
    ts = start + timedelta(minutes=i)

db2.commit()

# Verify
c2.execute("SELECT COUNT(*) FROM tbl_energy_value WHERE point_id = %s", (new_point_id,))
total = c2.fetchone()[0]
c2.execute("SELECT COUNT(*) FROM tbl_energy_value WHERE point_id = %s AND actual_value = 0", (new_point_id,))
zeros = c2.fetchone()[0]

print(f"Inserted {count} all-zero rows into tbl_energy_value for point_id={new_point_id}")
print(f"Verification: total={total}, zero_values={zeros}")
print(f"Data range: {start} to {now_utc}")

db2.close()
print("Done!")