"""
Insert test data for meter realtime analysis.
Adds data with both zero and non-zero values to tbl_energy_value.
"""
import mysql.connector
from datetime import datetime, timedelta, timezone

DB_HOST = '192.168.43.24'
DB_USER = 'root'
DB_PASSWORD = '030508'
DB_NAME = 'myems_historical_db'

now_utc = datetime.now(timezone.utc)
print(f'Current UTC time: {now_utc}')

db = mysql.connector.connect(
    host=DB_HOST, port=3306, user=DB_USER, password=DB_PASSWORD,
    database=DB_NAME, connect_timeout=5
)
c = db.cursor()

point_id = 1
count = 0
start = now_utc - timedelta(minutes=60)
end = now_utc

print(f'Inserting data from {start} to {end}')

i = 0
ts = start
while ts <= end:
    # Zero values at specific intervals to test the display: every 10th, every 7th, and the last 2 minutes
    if i % 10 == 0 or i % 7 == 0:
        val = 0
    else:
        val = 50 + (i % 30)

    sql = "INSERT INTO tbl_energy_value (point_id, utc_date_time, actual_value, is_bad, is_published) VALUES (%s, %s, %s, 0, 1)"
    c.execute(sql, (point_id, ts.strftime('%Y-%m-%d %H:%M:%S'), val))
    count += 1
    i += 1
    ts = start + timedelta(minutes=i)

db.commit()
print(f'Inserted {count} rows')

# Verify
c.execute('SELECT COUNT(*) FROM tbl_energy_value WHERE point_id = 1')
total = c.fetchone()[0]
c.execute('SELECT COUNT(*) FROM tbl_energy_value WHERE point_id = 1 AND actual_value = 0')
zeros = c.fetchone()[0]
c.execute('SELECT COUNT(*) FROM tbl_energy_value WHERE point_id = 1 AND actual_value > 0')
nonzeros = c.fetchone()[0]
print(f'Verification: total={total}, zero_values={zeros}, non_zero_values={nonzeros}')

# Show zero-value records
c.execute('SELECT utc_date_time, actual_value FROM tbl_energy_value WHERE point_id = 1 AND actual_value = 0 ORDER BY utc_date_time')
zero_rows = c.fetchall()
print(f'\nZero values inserted at:')
for r in zero_rows:
    print(f'  {r[0]} -> {r[1]}')

db.close()
print('\nDone!')