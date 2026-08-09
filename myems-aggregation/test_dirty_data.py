"""
Test script to verify the fix for dirty data handling in
combined_equipment_carbon_input_category.py

This test simulates the Step 3 processing loop to confirm that:
1. Normal data passes through correctly
2. None rows are skipped (not crashed)
3. Short rows are skipped (not crashed)
4. None actual_value rows are skipped (not crashed)
"""
import unittest
from datetime import datetime
from decimal import Decimal


def process_rows_original(rows_hourly):
    """
    Simulates the ORIGINAL code (without defense).
    This is expected to crash on dirty data.
    """
    energy_dict = dict()
    energy_category_list = list()
    end_datetime_utc = datetime(2024, 1, 1, 0, 0, 0)
    for row_hourly in rows_hourly:
        # ORIGINAL: direct access without checks
        current_datetime_utc = row_hourly[0]
        energy_category_id = row_hourly[1]
        if energy_category_id not in energy_category_list:
            energy_category_list.append(energy_category_id)
        actual_value = row_hourly[2]
        if energy_dict.get(current_datetime_utc) is None:
            energy_dict[current_datetime_utc] = dict()
        energy_dict[current_datetime_utc][energy_category_id] = actual_value
        if current_datetime_utc > end_datetime_utc:
            end_datetime_utc = current_datetime_utc
    return energy_dict, energy_category_list, end_datetime_utc


def process_rows_fixed(rows_hourly):
    """
    Simulates the FIXED code (with defense).
    Should handle dirty data gracefully.
    """
    energy_dict = dict()
    energy_category_list = list()
    end_datetime_utc = datetime(2024, 1, 1, 0, 0, 0)
    for row_hourly in rows_hourly:
        # FIXED: check before access
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
    return energy_dict, energy_category_list, end_datetime_utc


class TestOriginalCode(unittest.TestCase):
    """Verify the ORIGINAL code crashes on dirty data"""

    def test_normal_data(self):
        """Normal data should work"""
        rows = [
            (datetime(2024, 1, 1, 0, 0, 0), 1, Decimal('100.0')),
        ]
        result = process_rows_original(rows)
        self.assertIsNotNone(result)

    def test_none_row_crashes(self):
        """None row -> TypeError in original code"""
        rows = [None]
        with self.assertRaises(TypeError):
            process_rows_original(rows)

    def test_short_row_crashes(self):
        """Row with < 3 elements -> IndexError in original code"""
        rows = [(datetime(2024, 1, 1, 0, 0, 0), 1)]
        with self.assertRaises(IndexError):
            process_rows_original(rows)


class TestFixedCode(unittest.TestCase):
    """Verify the FIXED code handles dirty data gracefully"""

    def test_normal_data(self):
        """Normal data should still work"""
        rows = [
            (datetime(2024, 1, 1, 0, 0, 0), 1, Decimal('100.0')),
        ]
        energy_dict, energy_category_list, end_datetime_utc = process_rows_fixed(rows)
        self.assertEqual(len(energy_dict), 1)
        self.assertEqual(energy_category_list, [1])
        self.assertEqual(energy_dict[datetime(2024, 1, 1, 0, 0, 0)][1], Decimal('100.0'))

    def test_none_row_skipped(self):
        """None row should be skipped, not crash"""
        rows = [None]
        energy_dict, energy_category_list, _ = process_rows_fixed(rows)
        self.assertEqual(len(energy_dict), 0)
        self.assertEqual(len(energy_category_list), 0)

    def test_short_row_skipped(self):
        """Short row should be skipped, not crash"""
        rows = [(datetime(2024, 1, 1, 0, 0, 0), 1)]
        energy_dict, energy_category_list, _ = process_rows_fixed(rows)
        self.assertEqual(len(energy_dict), 0)
        self.assertEqual(len(energy_category_list), 0)

    def test_none_actual_value_skipped(self):
        """Row with None actual_value should be skipped"""
        rows = [
            (datetime(2024, 1, 1, 0, 0, 0), 1, None),
        ]
        energy_dict, energy_category_list, _ = process_rows_fixed(rows)
        self.assertEqual(len(energy_dict), 0)
        self.assertEqual(len(energy_category_list), 0)

    def test_mixed_data(self):
        """Mix of normal and dirty data: dirty rows skipped, normal rows processed"""
        dt = datetime(2024, 1, 1, 0, 0, 0)
        rows = [
            None,
            (dt, 1, Decimal('50.0')),
            (dt, 2,),  # short row
            (dt, 3, Decimal('75.0')),
            None,
            (dt, 4, None),  # None actual_value
        ]
        energy_dict, energy_category_list, _ = process_rows_fixed(rows)
        # Only rows with valid data should be processed
        self.assertEqual(len(energy_dict), 1)
        self.assertIn(1, energy_category_list)
        self.assertIn(3, energy_category_list)
        self.assertNotIn(2, energy_category_list)  # short row skipped
        self.assertNotIn(4, energy_category_list)  # None actual_value skipped
        self.assertEqual(energy_dict[dt][1], Decimal('50.0'))
        self.assertEqual(energy_dict[dt][3], Decimal('75.0'))


if __name__ == '__main__':
    unittest.main()