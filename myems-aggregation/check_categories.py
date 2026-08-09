import mysql.connector
import sys

db = mysql.connector.connect(host='192.168.1.26', port=3306, user='root', password='!MyEMS1', database='myems_system_db', connect_timeout=5)
c = db.cursor()

# Just get IDs and units, skip names
c.execute('SELECT id, unit_of_measure FROM tbl_energy_categories ORDER BY id')
rows = c.fetchall()
sys.stdout.write('Categories (id, unit):\n')
for r in rows:
    unit = r[1].encode('ascii', errors='replace').decode('ascii')
    sys.stdout.write('  %d, %s\n' % (r[0], unit))

c.execute('SELECT id, energy_category_id FROM tbl_energy_items ORDER BY id')
rows2 = c.fetchall()
sys.stdout.write('Items (id, cat_id):\n')
for r2 in rows2:
    sys.stdout.write('  %d, %d\n' % (r2[0], r2[1]))

# Check if there's data for other categories in the hourly tables
db2 = mysql.connector.connect(host='192.168.1.26', port=3306, user='root', password='!MyEMS1', database='myems_energy_db', connect_timeout=5)
c2 = db2.cursor()
c2.execute('SELECT DISTINCT energy_item_id FROM tbl_space_input_item_hourly WHERE space_id=2 ORDER BY energy_item_id')
items = c2.fetchall()
sys.stdout.write('Space 2 existing items:\n')
for it in items:
    sys.stdout.write('  %d\n' % it[0])

db.close()
db2.close()