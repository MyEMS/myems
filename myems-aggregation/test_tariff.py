from datetime import datetime
import tariff


def main():
    """main"""
    print('Testing get_energy_category_tariffs ...')
    cost_center_id = 1
    energy_category_id = 1
    start_date_time_utc = datetime.strptime('2020-06-29 16:00:00', '%Y-%m-%d %H:%M:%S')
    end_date_time_utc = datetime.strptime('2020-07-01 15:59:59', '%Y-%m-%d %H:%M:%S')
    tariffs = tariff.get_energy_category_tariffs(cost_center_id,
                                                 energy_category_id,
                                                 start_date_time_utc,
                                                 end_date_time_utc)
    for k, v in sorted(tariffs.items()):
        print(k, v)

    print('Testing get_energy_item_tariffs ...')
    cost_center_id = 1
    energy_item_id = 1
    start_date_time_utc = datetime.strptime('2020-06-29 16:00:00', '%Y-%m-%d %H:%M:%S')
    end_date_time_utc = datetime.strptime('2020-07-01 15:59:59', '%Y-%m-%d %H:%M:%S')
    tariffs = tariff.get_energy_item_tariffs(cost_center_id,
                                             energy_item_id,
                                             start_date_time_utc,
                                             end_date_time_utc)
    for k, v in sorted(tariffs.items()):
        print(k, v)


if __name__ == "__main__":
    main()
