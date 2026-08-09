import mysql.connector
from datetime import datetime, timezone, timedelta
import sys
import uuid

DB_HOST = '192.168.1.26'
DB_USER = 'root'
DB_PASSWORD = '!MyEMS1'

# Connect to system DB
db = mysql.connector.connect(
    host=DB_HOST, port=3306, user=DB_USER, password=DB_PASSWORD,
    database='myems_system_db', connect_timeout=5
)
c = db.cursor()

# Create a new energy item for category 6 (T - Tonne, steam)
# Check max id
c.execute('SELECT MAX(id) FROM tbl_energy_items')
max_id = c.fetchone()[0]
new_item_id = max_id + 1

c.execute(
    "INSERT INTO tbl_energy_items (id, name, uuid, energy_category_id) VALUES (%s, %s, %s, %s)",
    (new_item_id, 'Test Steam Item', str(uuid.uuid4()), 6)
)
sys.stdout.write('Created energy item ID=%d for category 6 (T)\n' % new_item_id)

db.commit()
db.close()

# Insert data into space, shopfloor, store, tenant tables
now_utc = datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0)
start = now_utc - timedelta(days=30)

db2 = mysql.connector.connect(
    host=DB_HOST, port=3306, user=DB_USER, password=DB_PASSWORD,
    database='myems_energy_db', connect_timeout=5
)
c2 = db2.cursor()

# Space 2
ts = start
i = 0
while ts < now_utc:
    val = 5 + (i % 3)
    c2.execute('INSERT INTO tbl_space_input_item_hourly (space_id, energy_item_id, start_datetime_utc, actual_value) VALUES (%s, %s, %s, %s)',
               (2, new_item_id, ts, val))
    i += 1
    ts = start + timedelta(hours=i)
sys.stdout.write('Space 2: inserted %d records for item %d (T)\n' % (i, new_item_id))

# Shopfloor 1
ts = start
i = 0
while ts < now_utc:
    val = 3 + (i % 2)
    c2.execute('INSERT INTO tbl_shopfloor_input_item_hourly (shopfloor_id, energy_item_id, start_datetime_utc, actual_value) VALUES (%s, %s, %s, %s)',
               (1, new_item_id, ts, val))
    i += 1
    ts = start + timedelta(hours=i)
sys.stdout.write('Shopfloor 1: inserted %d records for item %d (T)\n' % (i, new_item_id))

# Store 1
ts = start
i = 0
while ts < now_utc:
    val = 4 + (i % 2)
    c2.execute('INSERT INTO tbl_store_input_item_hourly (store_id, energy_item_id, start_datetime_utc, actual_value) VALUES (%s, %s, %s, %s)',
               (1, new_item_id, ts, val))
    i += 1
    ts = start + timedelta(hours=i)
sys.stdout.write('Store 1: inserted %d records for item %d (T)\n' % (i, new_item_id))

# Tenant 1
ts = start
i = 0
while ts < now_utc:
    val = 2 + (i % 2)
    c2.execute('INSERT INTO tbl_tenant_input_item_hourly (tenant_id, energy_item_id, start_datetime_utc, actual_value) VALUES (%s, %s, %s, %s)',
               (1, new_item_id, ts, val))
    i += 1
    ts = start + timedelta(hours=i)
sys.stdout.write('Tenant 1: inserted %d records for item %d (T)\n' % (i, new_item_id))

db2.commit()
db2.close()
sys.stdout.write('Done!\n')