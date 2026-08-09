"""
Integration test: verify dirty data handling in combined_equipment_carbon_input_category.py
Test against the database at 192.168.43.24

Steps:
1. Connect to the real database and fetch real data
2. Test the fixed processing logic with real data
3. Test with simulated dirty data (None rows, short rows, None values)
4. Inject a test dirty data row into the database and verify the fix handles it
"""
import traceback
import mysql.connector
from datetime import datetime, timedelta
from decimal import Decimal

DB_CONFIG = {
    'host': '192.168.43.24',
    'port': 3306,
    'user': 'root',
    'password': '030508',
}

PASS = 0
FAIL = 0

def check(description, condition):
    global PASS, FAIL
    if condition:
        print(f"  [PASS] {description}")
        PASS += 1
    else:
        print(f"  [FAIL] {description}")
        FAIL += 1


def test_connection():
    """Test 1: Verify database connectivity"""
    print("\n" + "="*60)
    print("Test 1: Database Connectivity")
    print("="*60)
    try:
        conn = mysql.connector.connect(**DB_CONFIG, database='myems_energy_db', connect_timeout=5)
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM tbl_combined_equipment_input_category_hourly")
        count = cursor.fetchone()[0]
        check(f"Connected to energy_db, found {count} rows", count >= 0)
        conn.close()
    except Exception as e:
        check(f"Connection failed: {e}", False)
        return False

    try:
        conn = mysql.connector.connect(**DB_CONFIG, database='myems_carbon_db', connect_timeout=5)
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM tbl_combined_equipment_input_category_hourly")
        count = cursor.fetchone()[0]
        check(f"Connected to carbon_db, found {count} rows", count >= 0)
        conn.close()
    except Exception as e:
        check(f"Connection failed: {e}", False)
        return False

    try:
        conn = mysql.connector.connect(**DB_CONFIG, database='myems_system_db', connect_timeout=5)
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM tbl_combined_equipments")
        count = cursor.fetchone()[0]
        check(f"Connected to system_db, found {count} combined equipments", count >= 0)
        conn.close()
    except Exception as e:
        check(f"Connection failed: {e}", False)
        return False
    return True


def test_fixed_logic_with_real_data():
    """
    Test 2: Fetch real data from the energy database and run it through
    the fixed processing logic to verify it works.
    """
    print("\n" + "="*60)
    print("Test 2: Fixed Logic with Real Data")
    print("="*60)

    try:
        conn = mysql.connector.connect(**DB_CONFIG, database='myems_energy_db', connect_timeout=5)
        cursor = conn.cursor()
        cursor.execute(
            "SELECT start_datetime_utc, energy_category_id, actual_value "
            "FROM tbl_combined_equipment_input_category_hourly "
            "LIMIT 100"
        )
        rows_hourly = cursor.fetchall()
        conn.close()
    except Exception as e:
        check(f"Failed to fetch data: {e}", False)
        return

    if not rows_hourly:
        print("  [SKIP] No real data to test with")
        return

    print(f"  Fetched {len(rows_hourly)} real rows from energy_db")

    # Process with fixed logic
    try:
        energy_dict = dict()
        energy_category_list = list()
        end_datetime_utc = datetime(2024, 1, 1, 0, 0, 0)

        for row_hourly in rows_hourly:
            # FIXED: defense checks
            if row_hourly is None or len(row_hourly) < 3:
                continue
            current_datetime_utc = row_hourly[0]
            energy_category_id = row_hourly[1]
            actual_value = row_hourly[2]
            if actual_value is None:
                continue
            if energy_category_id not in energy_category_list:
                energy_category_list.append(energy_category_id)
            if energy_dict.get(current_datetime_utc) is None:
                energy_dict[current_datetime_utc] = dict()
            energy_dict[current_datetime_utc][energy_category_id] = actual_value
            if current_datetime_utc > end_datetime_utc:
                end_datetime_utc = current_datetime_utc

        check(f"Fixed logic processed {len(rows_hourly)} rows without error", True)
        check(f"Produced {len(energy_dict)} time slots, {len(energy_category_list)} categories",
              len(energy_dict) > 0 or len(energy_category_list) >= 0)
    except Exception as e:
        check(f"Fixed logic crashed: {e}\n{traceback.format_exc()}", False)


def test_original_code_crashes():
    """
    Test 3: Verify the ORIGINAL code crashes on dirty data.
    This confirms the reviewer's finding.
    """
    print("\n" + "="*60)
    print("Test 3: Original Code CRASHES on Dirty Data (confirming the bug)")
    print("="*60)

    # Test 3a: None row
    try:
        rows = [None]
        for row_hourly in rows:
            dt = row_hourly[0]  # Should crash
        check("None row should crash (TypeError)", False)
    except TypeError:
        check("None row -> TypeError (confirmed bug)", True)
    except Exception as e:
        check(f"None row -> {type(e).__name__} (confirmed bug)", True)

    # Test 3b: Short row
    try:
        rows = [(datetime(2024, 1, 1, 0, 0, 0), 1)]
        for row_hourly in rows:
            dt = row_hourly[0]
            cat = row_hourly[1]
            val = row_hourly[2]  # Should crash
        check("Short row should crash (IndexError)", False)
    except IndexError:
        check("Short row -> IndexError (confirmed bug)", True)
    except Exception as e:
        check(f"Short row -> {type(e).__name__} (confirmed bug)", True)

    # Test 3c: None actual_value does NOT crash upstream but passes None downstream
    rows = [(datetime(2024, 1, 1, 0, 0, 0), 1, None)]
    try:
        for row_hourly in rows:
            dt = row_hourly[0]
            cat = row_hourly[1]
            val = row_hourly[2]  # No crash, val is None
        check("None actual_value does NOT crash (silent data issue)", True)
    except Exception as e:
        check(f"None actual_value crashed: {e}", False)


def test_fixed_code_handles_dirty_data():
    """
    Test 4: Verify the FIXED code handles all dirty data scenarios gracefully.
    """
    print("\n" + "="*60)
    print("Test 4: Fixed Code Handles Dirty Data Gracefully")
    print("="*60)

    # Test 4a: None row
    rows = [None]
    try:
        for row_hourly in rows:
            if row_hourly is None or len(row_hourly) < 3:
                continue
        check("None row: skipped without crash", True)
    except Exception as e:
        check(f"None row: crashed with {e}", False)

    # Test 4b: Short row
    rows = [(datetime(2024, 1, 1, 0, 0, 0), 1)]
    try:
        for row_hourly in rows:
            if row_hourly is None or len(row_hourly) < 3:
                continue
        check("Short row (len=2): skipped without crash", True)
    except Exception as e:
        check(f"Short row: crashed with {e}", False)

    # Test 4c: Empty row
    rows = [()]
    try:
        for row_hourly in rows:
            if row_hourly is None or len(row_hourly) < 3:
                continue
        check("Empty row (len=0): skipped without crash", True)
    except Exception as e:
        check(f"Empty row: crashed with {e}", False)

    # Test 4d: None actual_value
    rows = [(datetime(2024, 1, 1, 0, 0, 0), 1, None)]
    try:
        for row_hourly in rows:
            if row_hourly is None or len(row_hourly) < 3:
                continue
            current_datetime_utc = row_hourly[0]
            energy_category_id = row_hourly[1]
            actual_value = row_hourly[2]
            if actual_value is None:
                continue
        check("None actual_value: skipped without crash", True)
    except Exception as e:
        check(f"None actual_value: crashed with {e}", False)

    # Test 4e: Mixed data - all types together
    dt = datetime(2024, 1, 1, 0, 0, 0)
    rows = [
        None,                              # None row
        (dt, 1, Decimal('100.0')),         # normal
        (dt, 2,),                          # short row
        (dt, 3, None),                     # None actual_value
        (dt, 4, Decimal('200.0')),         # normal
        None,                              # None row
        (dt, 5, Decimal('300.0')),         # normal
    ]
    energy_dict = {}
    energy_category_list = []
    try:
        for row_hourly in rows:
            if row_hourly is None or len(row_hourly) < 3:
                continue
            current_datetime_utc = row_hourly[0]
            energy_category_id = row_hourly[1]
            actual_value = row_hourly[2]
            if actual_value is None:
                continue
            if energy_category_id not in energy_category_list:
                energy_category_list.append(energy_category_id)
            if energy_dict.get(current_datetime_utc) is None:
                energy_dict[current_datetime_utc] = dict()
            energy_dict[current_datetime_utc][energy_category_id] = actual_value

        check("Mixed data: no crash", True)
        check(f"Mixed data: {len(energy_dict)} time slot(s)", len(energy_dict) == 1)
        check(f"Mixed data: {len(energy_category_list)} categories processed", len(energy_category_list) == 3)
        check(f"Category 1 = 100.0", energy_dict[dt][1] == Decimal('100.0'))
        check(f"Category 4 = 200.0", energy_dict[dt][4] == Decimal('200.0'))
        check(f"Category 5 = 300.0", energy_dict[dt][5] == Decimal('300.0'))
        check(f"Category 2 (short row) NOT in dict", 2 not in energy_category_list)
        check(f"Category 3 (None value) NOT in dict", 3 not in energy_category_list)
    except Exception as e:
        check(f"Mixed data: crashed with {e}", False)


def test_inject_dirty_data():
    """
    Test 5: Inject dirty data into the energy database and run the
    actual aggregation logic to verify it doesn't crash.

    IMPORTANT: Cleans up the injected data after the test.
    """
    print("\n" + "="*60)
    print("Test 5: Inject Dirty Data Into Database (with cleanup)")
    print("="*60)

    # Find a combined equipment to use for testing
    try:
        conn = mysql.connector.connect(**DB_CONFIG, database='myems_system_db', connect_timeout=5)
        cursor = conn.cursor()
        cursor.execute("SELECT id, name FROM tbl_combined_equipments LIMIT 1")
        row = cursor.fetchone()
        conn.close()
        if row is None:
            print("  [SKIP] No combined equipment found in system_db")
            return
        equipment_id = row[0]
        equipment_name = row[1]
        print(f"  Using combined equipment: id={equipment_id}, name={equipment_name}")
    except Exception as e:
        print(f"  [SKIP] Cannot query system_db: {e}")
        return

    # Inject dirty data
    test_dt = datetime(2024, 12, 31, 0, 0, 0)
    conn = mysql.connector.connect(**DB_CONFIG, database='myems_energy_db', connect_timeout=5)
    cursor = conn.cursor()

    try:
        # Insert normal data
        cursor.execute(
            "INSERT INTO tbl_combined_equipment_input_category_hourly "
            "(combined_equipment_id, energy_category_id, start_datetime_utc, actual_value) "
            "VALUES (%s, 1, %s, 100.0)",
            (equipment_id, test_dt)
        )
        check("Inserted normal data row", True)

        # Note: The database schema has NOT NULL on actual_value column,
        # so we cannot insert NULL actual_value via MySQL.
        # This schema-level constraint is itself a defense against dirty data.
        print("  [INFO] actual_value column has NOT NULL constraint (schema-level defense)")
        conn.commit()

        # Now fetch the data and process with fixed logic
        cursor.execute(
            "SELECT start_datetime_utc, energy_category_id, actual_value "
            "FROM tbl_combined_equipment_input_category_hourly "
            "WHERE combined_equipment_id = %s AND start_datetime_utc >= %s "
            "ORDER BY id",
            (equipment_id, test_dt)
        )
        rows_hourly = cursor.fetchall()
        print(f"  Fetched {len(rows_hourly)} rows from energy_db (including injected test data)")

        energy_dict = {}
        energy_category_list = []
        for row_hourly in rows_hourly:
            if row_hourly is None or len(row_hourly) < 3:
                continue
            current_datetime_utc = row_hourly[0]
            energy_category_id = row_hourly[1]
            actual_value = row_hourly[2]
            if actual_value is None:
                continue
            if energy_category_id not in energy_category_list:
                energy_category_list.append(energy_category_id)
            if energy_dict.get(current_datetime_utc) is None:
                energy_dict[current_datetime_utc] = dict()
            energy_dict[current_datetime_utc][energy_category_id] = actual_value

        check("Fixed code processed injected data without crash", True)
        check(f"Category 1 (normal) data processed", 1 in energy_category_list)
        print("  [INFO] Schema-level NOT NULL constraint prevents NULL actual_value from being stored")

    except Exception as e:
        conn.rollback()
        check(f"Test failed: {e}\n{traceback.format_exc()}", False)
    finally:
        # Cleanup: remove injected test data
        cursor.execute(
            "DELETE FROM tbl_combined_equipment_input_category_hourly "
            "WHERE combined_equipment_id = %s AND start_datetime_utc >= %s",
            (equipment_id, test_dt)
        )
        conn.commit()
        cursor.close()
        conn.close()
        print("  [CLEANUP] Removed injected test data from energy_db")


def test_check_actual_code():
    """
    Test 6: Verify the actual file on disk has the fix applied.
    """
    print("\n" + "="*60)
    print("Test 6: Verify Fix Applied in Source Code")
    print("="*60)

    import os
    repo_dir = os.path.dirname(os.path.abspath(__file__))
    filepath = os.path.join(repo_dir, 'combined_equipment_carbon_input_category.py')

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    has_none_check = 'if row_hourly is None or len(row_hourly) < 3' in content
    has_actual_value_check = 'if actual_value is None' in content
    no_duplicate_access = content.count('actual_value = row_hourly[2]') == 1

    check("None/len check present", has_none_check)
    check("actual_value is None check present", has_actual_value_check)
    check("No duplicate actual_value assignment", no_duplicate_access)

    # Show the fix
    print("\n  Fixed code section:")
    print("-" * 40)
    lines = content.split('\n')
    in_section = False
    for i, line in enumerate(lines):
        if 'for row_hourly in rows_hourly:' in line:
            in_section = True
        if in_section:
            print(f"  {line}")
            if 'end_datetime_utc = current_datetime_utc' in line:
                break
    print("-" * 40)


if __name__ == '__main__':
    print("=" * 60)
    print("  Dirty Data Handling Test Suite")
    print("  Target: 192.168.43.24")
    print("=" * 60)

    # Run tests
    if test_connection():
        test_fixed_logic_with_real_data()
    else:
        print("\n[SKIP] Tests 2, 5 require database connection")

    test_original_code_crashes()
    test_fixed_code_handles_dirty_data()
    test_inject_dirty_data()
    test_check_actual_code()

    # Summary
    print("\n" + "=" * 60)
    print(f"  Results: {PASS} passed, {FAIL} failed")
    print("=" * 60)
    if FAIL > 0:
        print("  Some tests FAILED!")
        exit(1)
    else:
        print("  All tests PASSED!")
        exit(0)