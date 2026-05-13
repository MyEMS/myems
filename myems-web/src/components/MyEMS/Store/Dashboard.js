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
    faArrowDown
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
    const [monthlyTrends, setMonthlyTrends] = useState({
        labels: [],
        energy: [],
        cost: []
    });

    // Pie chart data
    const [energyCategoryPieData, setEnergyCategoryPieData] = useState([]);
    const [costCategoryPieData, setCostCategoryPieData] = useState([]);
    const [tcePieData, setTcePieData] = useState([]);
    const [tco2ePieData, setTco2ePieData] = useState([]);

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

            // Process monthly trends
            if (json.reporting_period_input.timestamps && json.reporting_period_input.timestamps.length > 0) {
                const labels = json.reporting_period_input.timestamps[0] || [];
                const energyValues = json.reporting_period_input.values || [];
                const costValues = json.reporting_period_cost.values || [];

                // Calculate total energy and cost per month
                const totalEnergy = labels.map((_, idx) =>
                    energyValues.reduce((sum, category) => sum + (category[idx] || 0), 0)
                );
                const totalCost = labels.map((_, idx) =>
                    costValues.reduce((sum, category) => sum + (category[idx] || 0), 0)
                );

                setMonthlyTrends({
                    labels,
                    energy: totalEnergy,
                    cost: totalCost
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
            toast.success(t('Dashboard data loaded successfully'));

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error(t('Failed to load dashboard data'));
            setLoading(false);
        }
    }, [periodType, basePeriodStart, basePeriodEnd, reportingPeriodStart, reportingPeriodEnd, setRedirect, setRedirectUrl, t]);

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

    // Prepare line chart data for monthly trends
    const prepareMonthlyTrendData = () => {
        const timestamps = {};
        const values = {};
        const options = [];

        if (monthlyTrends.labels && monthlyTrends.labels.length > 0) {
            timestamps['a0'] = monthlyTrends.labels;
            values['a0'] = monthlyTrends.energy;
            timestamps['a1'] = monthlyTrends.labels;
            values['a1'] = monthlyTrends.cost;
            options.push({value: 'a0', label: t('Energy Consumption')});
            options.push({value: 'a1', label: t('Cost')});
        }

        return {timestamps, values, options};
    };

    const monthlyTrendChartData = prepareMonthlyTrendData();

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
                    footnote={t('Active Meters')}
                    footvalue={summary.total_meters || 0}
                    footunit=""
                    secondfootnote={t('Total Area')}
                    secondfootvalue={summary.total_area || 0}
                    secondfootunit="m²"
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
                    footnote={t('Per Unit Area')}
                    footvalue={summary.total_area > 0 ? 
                        parseFloat((energyData.total_in_kgce || 0) / summary.total_area).toFixed(3) : 0}
                    footunit="(kgCE/m²)"
                    secondfootnote={t('Per Capita')}
                    secondfootvalue={0}
                    secondfootunit="(kgCE)"
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
                        UNIT: null
                    })}
                    color="success"
                    footnote={t('Per Unit Area')}
                    footvalue={0}
                    footunit=""
                    secondfootnote={t('Categories')}
                    secondfootvalue={costData.names?.length || 0}
                    secondfootunit=""
                >
                    ¥<CountUp
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
                    footnote={t('Per Unit Area')}
                    footvalue={summary.total_area > 0 ? 
                        parseFloat((energyData.total_in_kgco2e || 0) / summary.total_area).toFixed(3) : 0}
                    footunit="(kgCO2E/m²)"
                    secondfootnote={t('Per Capita')}
                    secondfootvalue={0}
                    secondfootunit="(kgCO2E)"
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
                    <SharePie data={energyCategoryPieData} title={t('Energy Consumption by Category')} />
                </Col>
                <Col className="mb-3 pr-lg-2 mb-3">
                    <SharePie data={costCategoryPieData} title={t('Costs by Energy Category')} />
                </Col>
                <Col className="mb-3 pr-lg-2 mb-3">
                    <SharePie data={tcePieData} title={t('Ton of Standard Coal by Energy Category')} />
                </Col>
                <Col className="mb-3 pr-lg-2 mb-3">
                    <SharePie data={tco2ePieData} title={t('Ton of Carbon Dioxide Emissions by Energy Category')} />
                </Col>
            </Row>

            {/* Monthly Trends Line Chart */}
            <div className="card-deck">
                <LineChart
                    reportingTitle={t("This Year's Consumption CATEGORY VALUE UNIT", { 
                        CATEGORY: null, 
                        VALUE: null, 
                        UNIT: null 
                    })}
                    baseTitle=""
                    labels={monthlyTrendChartData.timestamps}
                    data={monthlyTrendChartData.values}
                    options={monthlyTrendChartData.options}
                />
            </div>

            {/* Store List Table */}
            <Row>
                <Col>
                    <Card className="mb-3">
                        <CardBody>
                            <h5 className="mb-3">
                                <FontAwesomeIcon icon={faArrowUp} className="mr-2"/>
                                {t('Store Performance Overview')}
                            </h5>
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead className="thead-light">
                                    <tr>
                                        <th>{t('Store Name')}</th>
                                        <th>{t('Address')}</th>
                                        <th className="text-right">{t('Store Area')}(m²)</th>
                                        <th className="text-right">{t('Energy Consumption')}</th>
                                        <th className="text-right">{t('Per Unit Area')}</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {allStores.map(store => {
                                        const storeEnergyData = topStores.find(ts => ts.id === store.id);
                                        const totalEnergy = storeEnergyData ? storeEnergyData.total_energy : 0;
                                        const perArea = store.area > 0 ? (totalEnergy / store.area).toFixed(2) : '0.00';
                                        
                                        return {
                                            ...store,
                                            totalEnergy,
                                            perArea
                                        };
                                    })
                                    .sort((a, b) => b.totalEnergy - a.totalEnergy)
                                    .map((store) => (
                                        <tr key={store.id}>
                                            <td>
                                                <strong>{store.name}</strong>
                                            </td>
                                            <td className="text-muted">{store.address || '-'}</td>
                                            <td className="text-right">{store.area ? store.area.toFixed(2) : '-'}</td>
                                            <td className="text-right">
                                                <strong>{store.totalEnergy.toFixed(2)}</strong>
                                            </td>
                                            <td className="text-right">{store.perArea}</td>
                                        </tr>
                                    ))}
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
