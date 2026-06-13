import React, {Fragment, useEffect, useState, useCallback} from 'react';
import CountUp from 'react-countup';
import {Col, Row, Card, CardBody} from 'reactstrap';
import {toast} from 'react-toastify';
import {getCookieValue, createCookie, checkEmpty} from '../../../helpers/utils';
import withRedirect from '../../../hoc/withRedirect';
import {withTranslation} from 'react-i18next';
import moment from 'moment';
import {APIBaseURL, settings} from '../../../config';
import {v4 as uuid} from 'uuid';
import CardSummary from '../common/CardSummary';
import SharePie from '../common/SharePie';
import BarChart from '../common/BarChart';
import LineChart from '../common/LineChart';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import {Line, Bar} from 'react-chartjs-2';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
    faArrowUp,
    faArrowDown,
    faSort,
    faSortUp,
    faSortDown
} from '@fortawesome/free-solid-svg-icons';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

const Dashboard = ({setRedirect, setRedirectUrl, t}) => {
    const [loading, setLoading] = useState(true);
    const [periodType, setPeriodType] = useState('monthly');

    // Date ranges
    const [reportingPeriodStart, setReportingPeriodStart] = useState(
        moment().startOf('year')
    );
    const [reportingPeriodEnd, setReportingPeriodEnd] = useState(moment());
    const [basePeriodStart, setBasePeriodStart] = useState(
        moment().subtract(1, 'years').startOf('year')
    );
    const [basePeriodEnd, setBasePeriodEnd] = useState(
        moment().subtract(1, 'years')
    );

    // Dashboard data
    const [summary, setSummary] = useState({
        total_stores: 0,
        total_area: 0,
        total_meters: 0,
        total_sensors: 0,
        total_alerts: 0
    });

    const [energyData, setEnergyData] = useState({
        names: [],
        units: [],
        subtotals: [],
        subtotals_in_kgce: [],
        subtotals_in_kgco2e: [],
        increment_rates: [],
        timestamps: [],
        values: []
    });

    const [costData, setCostData] = useState({
        names: [],
        units: [],
        subtotals: [],
        increment_rates: [],
        timestamps: [],
        values: []
    });

    const [topStores, setTopStores] = useState([]);
    const [allStores, setAllStores] = useState([]);
    const [dailyTrends, setDailyTrends] = useState({
        labels: [],
        energy: [],
        cost: [],
        categoryNames: [],
        categoryUnits: []
    });

    // Pie chart data
    const [energyCategoryPieData, setEnergyCategoryPieData] = useState([]);
    const [costCategoryPieData, setCostCategoryPieData] = useState([]);
    const [tcePieData, setTcePieData] = useState([]);
    const [tco2ePieData, setTco2ePieData] = useState([]);

    // Sorting state
    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: 'asc'
    });

    // Fetch dashboard data
    const fetchDashboardData = useCallback(async () => {
        let is_logged_in = getCookieValue('is_logged_in');
        let user_uuid = getCookieValue('user_uuid');
        let token = getCookieValue('token');

        if (checkEmpty(is_logged_in) || checkEmpty(token) || checkEmpty(user_uuid) || !is_logged_in) {
            setRedirectUrl(`/authentication/basic/login`);
            setRedirect(true);
            return;
        }

        createCookie('is_logged_in', true, settings.cookieExpireTime);
        createCookie('user_uuid', user_uuid, settings.cookieExpireTime);
        createCookie('token', token, settings.cookieExpireTime);

        try {
            setLoading(true);

            const params = new URLSearchParams({
                useruuid: user_uuid,
                periodtype: periodType,
                baseperiodstartdatetime: basePeriodStart.format('YYYY-MM-DDTHH:mm:ss'),
                baseperiodenddatetime: basePeriodEnd.format('YYYY-MM-DDTHH:mm:ss'),
                reportingperiodstartdatetime: reportingPeriodStart.format('YYYY-MM-DDTHH:mm:ss'),
                reportingperiodenddatetime: reportingPeriodEnd.format('YYYY-MM-DDTHH:mm:ss')
            });

            const response = await fetch(`${APIBaseURL}/reports/storedashboard?${params}`, {
                method: 'GET',
                headers: {
                    'Content-type': 'application/json',
                    'User-UUID': user_uuid,
                    Token: token
                }
            });

            if (!response.ok) {
                throw new Error('API request failed');
            }

            const json = await response.json();

            setSummary(json.summary || {});
            setEnergyData(json.reporting_period_input || {});
            setCostData(json.reporting_period_cost || {});
            setTopStores(json.top_stores || []);
            setAllStores(json.stores || []);

            // Process daily trends
            if (json.reporting_period_input.timestamps && json.reporting_period_input.timestamps.length > 0) {
                const labels = json.reporting_period_input.timestamps[0] || [];
                const energyValues = json.reporting_period_input.values || [];
                const costValues = json.reporting_period_cost.values || [];
                const categoryNames = json.reporting_period_input.category_names || [];
                const categoryUnits = json.reporting_period_input.category_units || [];

                setDailyTrends({
                    labels,
                    energy: energyValues,
                    cost: costValues,
                    categoryNames,
                    categoryUnits
                });
            }

            // Process pie chart data - Energy Categories
            let energyCategoryArray = [];
            json.reporting_period_input.names.forEach((currentValue, index) => {
                let item = {};
                item.id = index;
                item.name = currentValue;
                item.value = json.reporting_period_input.subtotals[index];
                item.color = '#' + (((1 << 24) * Math.random()) | 0).toString(16);
                energyCategoryArray.push(item);
            });
            setEnergyCategoryPieData(energyCategoryArray);

            // Process pie chart data - Cost Categories
            let costCategoryArray = [];
            json.reporting_period_cost.names.forEach((currentValue, index) => {
                let item = {};
                item.id = index;
                item.name = currentValue;
                item.value = json.reporting_period_cost.subtotals[index];
                item.color = '#' + (((1 << 24) * Math.random()) | 0).toString(16);
                costCategoryArray.push(item);
            });
            setCostCategoryPieData(costCategoryArray);

            // Process pie chart data - TCE
            let tceArray = [];
            json.reporting_period_input.names.forEach((currentValue, index) => {
                let item = {};
                item.id = index;
                item.name = currentValue;
                item.value = json.reporting_period_input.subtotals_in_kgce[index] / 1000;
                item.color = '#' + (((1 << 24) * Math.random()) | 0).toString(16);
                tceArray.push(item);
            });
            setTcePieData(tceArray);

            // Process pie chart data - TCO2E
            let tco2eArray = [];
            json.reporting_period_input.names.forEach((currentValue, index) => {
                let item = {};
                item.id = index;
                item.name = currentValue;
                item.value = json.reporting_period_input.subtotals_in_kgco2e[index] / 1000;
                item.color = '#' + (((1 << 24) * Math.random()) | 0).toString(16);
                tco2eArray.push(item);
            });
            setTco2ePieData(tco2eArray);

            setLoading(false);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error(t('Failed to load dashboard data'));
            setLoading(false);
        }
    }, [periodType, basePeriodStart, basePeriodEnd, reportingPeriodStart, reportingPeriodEnd, setRedirect, setRedirectUrl, t]);

    // Handle sorting
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({key, direction});
    };

    // Get sorted stores
    const getSortedStores = () => {
        if (!sortConfig.key) {
            return allStores.sort((a, b) => b.total_energy - a.total_energy);
        }

        const sortedStores = [...allStores];
        sortedStores.sort((a, b) => {
            let aValue, bValue;

            switch (sortConfig.key) {
                case 'name':
                    aValue = a.name;
                    bValue = b.name;
                    break;
                case 'address':
                    aValue = a.address || '';
                    bValue = b.address || '';
                    break;
                case 'area':
                    aValue = a.area !== null && a.area !== undefined ? a.area : 0;
                    bValue = b.area !== null && b.area !== undefined ? b.area : 0;
                    break;
                case 'cost':
                    aValue = a.total_cost !== null && a.total_cost !== undefined ? a.total_cost : 0;
                    bValue = b.total_cost !== null && b.total_cost !== undefined ? b.total_cost : 0;
                    break;
                case 'carbon':
                    aValue = a.total_carbon !== null && a.total_carbon !== undefined ? a.total_carbon : 0;
                    bValue = b.total_carbon !== null && b.total_carbon !== undefined ? b.total_carbon : 0;
                    break;
                default:
                    if (sortConfig.key.startsWith('energy_')) {
                        const index = parseInt(sortConfig.key.split('_')[1]);
                        const ecId = energyData.energy_category_ids && energyData.energy_category_ids[index];
                        aValue = a.energy_by_category && a.energy_by_category[ecId] ? a.energy_by_category[ecId] : 0;
                        bValue = b.energy_by_category && b.energy_by_category[ecId] ? b.energy_by_category[ecId] : 0;
                    }
                    break;
            }

            if (typeof aValue === 'string') {
                return sortConfig.direction === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }

            return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        });

        return sortedStores;
    };

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    // Check login status periodically
    useEffect(() => {
        const timer = setInterval(() => {
            let is_logged_in = getCookieValue('is_logged_in');
            if (is_logged_in === null || !is_logged_in) {
                setRedirectUrl(`/authentication/basic/login`);
                setRedirect(true);
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [setRedirect, setRedirectUrl]);

    // Prepare bar chart data for top stores
    const prepareTopStoresBarData = () => {
        const labels = topStores.map(store => store.name);
        const data = topStores.map(store => ({
            name: store.name,
            subtotal: store.total_energy,
            unit: 'kWh',
            increment_rate: null,
            subtotal_per_unit_area: 0,
            subtotal_per_capita: 0
        }));
        return {labels, data};
    };

    const topStoresBarData = prepareTopStoresBarData();

    // Prepare line chart data for daily trends - now by energy category
    const prepareDailyTrendData = () => {
        const timestamps = {};
        const values = {};
        const options = [];

        if (dailyTrends.labels && dailyTrends.labels.length > 0) {
            // Add cost option first (as default)
            if (dailyTrends.cost && dailyTrends.cost.length > 0) {
                timestamps['cost'] = dailyTrends.labels;
                // Sum all cost categories for each day
                const totalCost = dailyTrends.labels.map((_, dayIndex) => {
                    return dailyTrends.cost.reduce((sum, costCategory) => {
                        return sum + (costCategory[dayIndex] || 0);
                    }, 0);
                });
                values['cost'] = totalCost;
                options.push({value: 'cost', label: t('CostData')+ ' (CNY)'});
            }

            // Add each energy category as a separate option
            dailyTrends.energy.forEach((categoryData, index) => {
                const key = `energy_${index}`;
                timestamps[key] = dailyTrends.labels;
                values[key] = categoryData;
                const categoryName = dailyTrends.categoryNames[index] || t('Unknown');
                const unit = dailyTrends.categoryUnits[index] || '';
                options.push({value: key, label: `${t(categoryName)} (${unit})`});
            });
        }

        return {timestamps, values, options};
    };

    const dailyTrendChartData = prepareDailyTrendData();

    // Set default selected option to cost
    const [selectedChartOption, setSelectedChartOption] = useState('cost');

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{minHeight: '400px'}}>
                <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">{t('Loading')}...</span>
                </div>
            </div>
        );
    }

    return (
        <Fragment>
            {/* Summary Cards - Using CardSummary component */}
            <div className="card-deck">
                <CardSummary
                    rate={null}
                    title={t('Total Stores')}
                    color="success"

                >
                    <CountUp end={summary.total_stores || 0} duration={2} separator=","/>
                </CardSummary>

                <CardSummary
                    rate={energyData.increment_rate_in_kgce !== undefined ?
                        (parseFloat(energyData.increment_rate_in_kgce * 100).toFixed(2) + '%') : null}
                    title={t("This Month's Consumption CATEGORY VALUE UNIT", {
                        CATEGORY: t('Ton of Standard Coal'),
                        VALUE: null,
                        UNIT: '(TCE)'
                    })}
                    color="warning"

                >
                    <CountUp
                        end={(energyData.total_in_kgce || 0) / 1000}
                        duration={2}
                        separator=","
                        decimals={2}
                    />
                </CardSummary>

                <CardSummary
                    rate={costData.subtotals && costData.subtotals.length > 0 ? '+0.00%' : null}
                    title={t("This Month's Costs CATEGORY VALUE UNIT", {
                        CATEGORY: null,
                        VALUE: null,
                        UNIT: costData.units && costData.units.length > 0 ? '(' + costData.units[0] + ')' : '(CNY)'
                    })}
                    color="success"

                >
                    <CountUp
                        end={costData.subtotals?.reduce((a, b) => a + b, 0) || 0}
                        duration={2}
                        decimals={2}
                        separator=","
                    />
                </CardSummary>

                <CardSummary
                    rate={energyData.increment_rate_in_kgco2e !== undefined ?
                        (parseFloat(energyData.increment_rate_in_kgco2e * 100).toFixed(2) + '%') : null}
                    title={t("This Month's Consumption CATEGORY VALUE UNIT", {
                        CATEGORY: t('Ton of Carbon Dioxide Emissions'),
                        VALUE: null,
                        UNIT: '(TCO2E)'
                    })}
                    color="warning"

                >
                    <CountUp
                        end={(energyData.total_in_kgco2e || 0) / 1000}
                        duration={2}
                        separator=","
                        decimals={2}
                    />
                </CardSummary>
            </div>

            {/* Charts Row - Four charts in one row using SharePie and BarChart */}
            <Row noGutters>
                <Col className="mb-3 pr-lg-2 mb-3">
                    <SharePie data={energyCategoryPieData} title={t('Energy Consumption by Category')}/>
                </Col>
                <Col className="mb-3 pr-lg-2 mb-3">
                    <SharePie data={costCategoryPieData} title={t('Costs by Energy Category')}/>
                </Col>
                <Col className="mb-3 pr-lg-2 mb-3">
                    <SharePie data={tcePieData} title={t('Ton of Standard Coal by Energy Category')}/>
                </Col>
                <Col className="mb-3 pr-lg-2 mb-3">
                    <SharePie data={tco2ePieData} title={t('Ton of Carbon Dioxide Emissions by Energy Category')}/>
                </Col>
            </Row>

            {/* Daily Trends Line Chart */}
            <div className="card-deck">
                <LineChart
                    reportingTitle={t("This Month's Consumption CATEGORY VALUE UNIT", {
                        CATEGORY: null,
                        VALUE: null,
                        UNIT: null
                    })}
                    baseTitle=""
                    labels={dailyTrendChartData.timestamps}
                    data={dailyTrendChartData.values}
                    options={dailyTrendChartData.options}
                    defaultOption={selectedChartOption}
                />
            </div>

            {/* Store List Table */}
            <Row>
                <Col>
                    <Card className="mb-3">
                        <CardBody>
                            <h5 className="mb-3">
                                {t('Detailed Data')}
                            </h5>
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead className="thead-light">
                                    <tr>
                                        <th
                                            onClick={() => handleSort('name')}
                                            style={{cursor: 'pointer'}}
                                        >
                                            {t('Store Name')}
                                            <FontAwesomeIcon
                                                icon={sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? faSortUp : faSortDown) : faSort}
                                                className="ml-1"
                                            />
                                        </th>
                                        <th
                                            onClick={() => handleSort('address')}
                                            style={{cursor: 'pointer'}}
                                        >
                                            {t('Address')}
                                            <FontAwesomeIcon
                                                icon={sortConfig.key === 'address' ? (sortConfig.direction === 'asc' ? faSortUp : faSortDown) : faSort}
                                                className="ml-1"
                                            />
                                        </th>
                                        <th
                                            className="text-right"
                                            onClick={() => handleSort('area')}
                                            style={{cursor: 'pointer'}}
                                        >
                                            {t('Store Area')}(m²)
                                            <FontAwesomeIcon
                                                icon={sortConfig.key === 'area' ? (sortConfig.direction === 'asc' ? faSortUp : faSortDown) : faSort}
                                                className="ml-1"
                                            />
                                        </th>
                                        {energyData.names && energyData.names.map((categoryName, index) => (
                                            <th
                                                key={index}
                                                className="text-right"
                                                onClick={() => handleSort(`energy_${index}`)}
                                                style={{cursor: 'pointer'}}
                                            >
                                                {t(categoryName)} ({energyData.units[index] || ''})
                                                <FontAwesomeIcon
                                                    icon={sortConfig.key === `energy_${index}` ? (sortConfig.direction === 'asc' ? faSortUp : faSortDown) : faSort}
                                                    className="ml-1"
                                                />
                                            </th>
                                        ))}
                                        <th
                                            className="text-right"
                                            onClick={() => handleSort('cost')}
                                            style={{cursor: 'pointer'}}
                                        >
                                            {t('Costs')} (CNY)
                                            <FontAwesomeIcon
                                                icon={sortConfig.key === 'cost' ? (sortConfig.direction === 'asc' ? faSortUp : faSortDown) : faSort}
                                                className="ml-1"
                                            />
                                        </th>
                                        <th
                                            className="text-right"
                                            onClick={() => handleSort('carbon')}
                                            style={{cursor: 'pointer'}}
                                        >
                                            {t('Microgrid Carbon')} (kgCO2e)
                                            <FontAwesomeIcon
                                                icon={sortConfig.key === 'carbon' ? (sortConfig.direction === 'asc' ? faSortUp : faSortDown) : faSort}
                                                className="ml-1"
                                            />
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {getSortedStores()
                                        .map((store) => {
                                            return (
                                                <tr key={store.id}>
                                                    <td>
                                                        <strong>{store.name}</strong>
                                                    </td>
                                                    <td className="text-muted">{store.address || '-'}</td>
                                                    <td className="text-right">{store.area ? store.area.toFixed(2) : '-'}</td>
                                                    {energyData.energy_category_ids && energyData.energy_category_ids.map((ecId, index) => {
                                                        const categoryEnergy = store.energy_by_category && store.energy_by_category[ecId]
                                                            ? store.energy_by_category[ecId]
                                                            : 0;
                                                        return (
                                                            <td key={index} className="text-right">
                                                                {categoryEnergy > 0 ? categoryEnergy.toFixed(2) : '-'}
                                                            </td>
                                                        );
                                                    })}
                                                    <td className="text-right">
                                                      {store.total_cost !== null && store.total_cost !== undefined && store.total_cost > 0
                                                          ? store.total_cost.toFixed(2)
                                                          : '-'}
                                                    </td>
                                                    <td className="text-right">
                                                      {store.total_carbon !== null && store.total_carbon !== undefined && store.total_carbon > 0
                                                          ? store.total_carbon.toFixed(2)
                                                          : '-'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>

        </Fragment>
    );
};

export default withTranslation()(withRedirect(Dashboard));
