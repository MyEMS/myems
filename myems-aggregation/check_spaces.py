"""
Insert test data for space energy item analysis (能耗分项分析).
"""
import mysql.connector
from datetime import datetime, timezone, timedelta

DB_HOST = '192.168.1.26'
DB_USER = 'root'
DB_PASSWORD = '030508'

# Connect to system DB
db = mysql.connector.connect(
    host=DB_HOST, port=3306, user=DB_USER, password=DB_PASSWORD,
    database='myems_system_db', connect_timeout=5
)
c = db.cursor()

# Check spaces with area and occupants
c.execute("SELECT id, name, area, number_of_occupants FROM tbl_spaces ORDER BY id")
spaces = c.fetchall()
print("=== Spaces ===")
for s in spaces:
    print("  ID=%s, name=%s, area=%s, occupants=%s" % s)

# Check energy items
c.execute("SELECT id, name, energy_category_id FROM tbl_energy_items ORDER BY id")
items = c.fetchall()
print("\n=== Energy Items ===")
for i in items:
    print("  ID=%s, name=%s, cat_id=%s" % i)

# Check existing data in tbl_space_input_item_hourly
db2 = mysql.connector.connect(
    host=DB_HOST, port=3306, user=DB_USER, password=DB_PASSWORD,
    database='myems_energy_db', connect_timeout=5
)
c2 = db2.cursor()
c2.execute("SELECT COUNT(*) FROM tbl_space_input_item_hourly")
count = c2.fetchone()[0]
print("\n=== Existing Data ===")
print("  tbl_space_input_item_hourly has %s rows" % count)
if count > 0:
    c2.execute("SELECT DISTINCT space_id FROM tbl_space_input_item_hourly LIMIT 10")
    space_ids = [r[0] for r in c2.fetchall()]
    print("  Space IDs with data: %s" % space_ids)

db.close()
db2.close()