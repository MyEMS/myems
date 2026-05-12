import React, {Fragment, useEffect, useState, useCallback} from 'react';
import CountUp from 'react-countup';
import {Col, Row, Card, CardBody, CardTitle, Progress, Badge} from 'reactstrap';
import {toast} from 'react-toastify';
import {getCookieValue, createCookie, checkEmpty} from '../../../helpers/utils';
import withRedirect from '../../../hoc/withRedirect';
import {withTranslation} from 'react-i18next';
import moment from 'moment';
import {APIBaseURL, settings} from '../../../config';
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
import {Line, Bar, Doughnut} from 'react-chartjs-2';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
    faBolt,
    faDollarSign,
    faLeaf,
    faExclamationTriangle,
    faStore,
    faChartLine,
    faArrowUp,
    faArrowDown
} from '@fortawesome/free-solid-svg-icons';
import '../../../assets/css/store-dashboard.css';

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
        subtotals: [],
        timestamps: [],
        values: []
    });

    const [topStores, setTopStores] = useState([]);
    const [monthlyTrends, setMonthlyTrends] = useState({
        labels: [],
        energy: [],
        cost: []
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

    // Chart configurations
    const energyCategoryChartData = {
        labels: energyData.names || [],
        datasets: [{
            label: t('Energy Consumption'),
            data: energyData.subtotals || [],
            backgroundColor: [
                'rgba(54, 162, 235, 0.8)',
                'rgba(255, 99, 132, 0.8)',
                'rgba(255, 206, 86, 0.8)',
                'rgba(75, 192, 192, 0.8)',
                'rgba(153, 102, 255, 0.8)',
                'rgba(255, 159, 64, 0.8)'
            ],
            borderColor: [
                'rgba(54, 162, 235, 1)',
                'rgba(255, 99, 132, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 2
        }]
    };

    const costShareChartData = {
        labels: costData.names || [],
        datasets: [{
            data: costData.subtotals || [],
            backgroundColor: [
                '#FF6384',
                '#36A2EB',
                '#FFCE56',
                '#4BC0C0',
                '#9966FF',
                '#FF9F40'
            ],
            hoverBackgroundColor: [
                '#FF6384',
                '#36A2EB',
                '#FFCE56',
                '#4BC0C0',
                '#9966FF',
                '#FF9F40'
            ]
        }]
    };

    const monthlyTrendChartData = {
        labels: monthlyTrends.labels || [],
        datasets: [
            {
                label: t('Energy Consumption'),
                data: monthlyTrends.energy || [],
                borderColor: 'rgb(54, 162, 235)',
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                tension: 0.4,
                yAxisID: 'y'
            },
            {
                label: t('Cost'),
                data: monthlyTrends.cost || [],
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                tension: 0.4,
                yAxisID: 'y1'
            }
        ]
    };

    const topStoresChartData = {
        labels: topStores.map(store => store.name) || [],
        datasets: [{
            label: t('Energy Consumption'),
            data: topStores.map(store => store.total_energy) || [],
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 2
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                font: {
                    size: 16
                }
            }
        }
    };

    const dualAxisOptions = {
        ...chartOptions,
        scales: {
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                title: {
                    display: true,
                    text: t('Energy')
                }
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                    display: true,
                    text: t('Cost')
                },
                grid: {
                    drawOnChartArea: false
                }
            }
        }
    };

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
            {/* Page Header */}
            <Row className="mb-4">
                <Col>
                    <h2 className="mb-0">
                        <FontAwesomeIcon icon={faStore} className="mr-2"/>
                        {t('Store Dashboard')}
                    </h2>
                    <p className="text-muted">
                        {t('Comprehensive overview of store energy performance')}
                    </p>
                </Col>
            </Row>

            {/* KPI Cards */}
            <Row className="mb-4">
                <Col xl={3} md={6} className="mb-3">
                    <Card className="h-100 border-left-primary shadow-sm">
                        <CardBody>
                            <Row noGutters className="align-items-center">
                                <Col xs={8}>
                                    <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                        {t('Total Stores')}
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                                        <CountUp end={summary.total_stores || 0} duration={2} separator=","/>
                                    </div>
                                </Col>
                                <Col xs={4} className="text-right">
                                    <FontAwesomeIcon icon={faStore} size="2x" className="text-gray-300"/>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                </Col>

                <Col xl={3} md={6} className="mb-3">
                    <Card className="h-100 border-left-success shadow-sm">
                        <CardBody>
                            <Row noGutters className="align-items-center">
                                <Col xs={8}>
                                    <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                                        {t('Total Area')}
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                                        <CountUp end={summary.total_area || 0} duration={2} decimals={2}
                                                 separator=","/> m²
                                    </div>
                                </Col>
                                <Col xs={4} className="text-right">
                                    <FontAwesomeIcon icon={faChartLine} size="2x" className="text-gray-300"/>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                </Col>

                <Col xl={3} md={6} className="mb-3">
                    <Card className="h-100 border-left-info shadow-sm">
                        <CardBody>
                            <Row noGutters className="align-items-center">
                                <Col xs={8}>
                                    <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                                        {t('Active Meters')}
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                                        <CountUp end={summary.total_meters || 0} duration={2} separator=","/>
                                    </div>
                                </Col>
                                <Col xs={4} className="text-right">
                                    <FontAwesomeIcon icon={faBolt} size="2x" className="text-gray-300"/>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                </Col>

                <Col xl={3} md={6} className="mb-3">
                    <Card
                        className={`h-100 shadow-sm ${summary.total_alerts > 0 ? 'border-left-danger' : 'border-left-warning'}`}>
                        <CardBody>
                            <Row noGutters className="align-items-center">
                                <Col xs={8}>
                                    <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                                        {t('Active Alerts')}
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                                        <CountUp end={summary.total_alerts || 0} duration={2} separator=","/>
                                    </div>
                                </Col>
                                <Col xs={4} className="text-right">
                                    <FontAwesomeIcon icon={faExclamationTriangle} size="2x" className="text-gray-300"/>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                </Col>
            </Row>

            {/* Energy & Carbon Summary Cards */}
            <Row className="mb-4">
                <Col xl={4} md={6} className="mb-3">
                    <Card className="h-100 bg-gradient-primary text-white">
                        <CardBody>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-uppercase mb-2">{t('Total Energy Consumption')}</h6>
                                    <h2 className="mb-0">
                                        <CountUp
                                            end={(energyData.total_in_kgce || 0) / 1000}
                                            duration={2}
                                            decimals={2}
                                            separator=","
                                        /> tce
                                    </h2>
                                    {energyData.increment_rate_in_kgce !== undefined && (
                                        <small>
                                            <FontAwesomeIcon
                                                icon={energyData.increment_rate_in_kgce >= 0 ? faArrowUp : faArrowDown}
                                                className="mr-1"
                                            />
                                            {Math.abs((energyData.increment_rate_in_kgce || 0) * 100).toFixed(2)}%
                                            vs {t('last period')}
                                        </small>
                                    )}
                                </div>
                                <FontAwesomeIcon icon={faBolt} size="3x" opacity="0.3"/>
                            </div>
                        </CardBody>
                    </Card>
                </Col>

                <Col xl={4} md={6} className="mb-3">
                    <Card className="h-100 bg-gradient-success text-white">
                        <CardBody>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-uppercase mb-2">{t('Total Cost')}</h6>
                                    <h2 className="mb-0">
                                        ¥<CountUp
                                        end={costData.subtotals?.reduce((a, b) => a + b, 0) || 0}
                                        duration={2}
                                        decimals={2}
                                        separator=","
                                    />
                                    </h2>
                                    <small>{t('Current Period')}</small>
                                </div>
                                <FontAwesomeIcon icon={faDollarSign} size="3x" opacity="0.3"/>
                            </div>
                        </CardBody>
                    </Card>
                </Col>

                <Col xl={4} md={6} className="mb-3">
                    <Card className="h-100 bg-gradient-info text-white">
                        <CardBody>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-uppercase mb-2">{t('Carbon Emissions')}</h6>
                                    <h2 className="mb-0">
                                        <CountUp
                                            end={(energyData.total_in_kgco2e || 0) / 1000}
                                            duration={2}
                                            decimals={2}
                                            separator=","
                                        /> tCO₂e
                                    </h2>
                                    {energyData.increment_rate_in_kgco2e !== undefined && (
                                        <small>
                                            <FontAwesomeIcon
                                                icon={energyData.increment_rate_in_kgco2e >= 0 ? faArrowUp : faArrowDown}
                                                className="mr-1"
                                            />
                                            {Math.abs((energyData.increment_rate_in_kgco2e || 0) * 100).toFixed(2)}%
                                            vs {t('last period')}
                                        </small>
                                    )}
                                </div>
                                <FontAwesomeIcon icon={faLeaf} size="3x" opacity="0.3"/>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>

            {/* Charts Row 1 */}
            <Row className="mb-4">
                <Col xl={6} lg={12} className="mb-3">
                    <Card className="shadow-sm h-100">
                        <CardTitle tag="h5" className="card-header py-3">
                            <FontAwesomeIcon icon={faChartLine} className="mr-2"/>
                            {t('Energy Consumption by Category')}
                        </CardTitle>
                        <CardBody>
                            <div style={{height: '350px'}}>
                                <Doughnut data={energyCategoryChartData} options={chartOptions}/>
                            </div>
                        </CardBody>
                    </Card>
                </Col>

                <Col xl={6} lg={12} className="mb-3">
                    <Card className="shadow-sm h-100">
                        <CardTitle tag="h5" className="card-header py-3">
                            <FontAwesomeIcon icon={faDollarSign} className="mr-2"/>
                            {t('Cost Distribution by Category')}
                        </CardTitle>
                        <CardBody>
                            <div style={{height: '350px'}}>
                                <Doughnut data={costShareChartData} options={chartOptions}/>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>

            {/* Monthly Trends */}
            <Row className="mb-4">
                <Col>
                    <Card className="shadow-sm">
                        <CardTitle tag="h5" className="card-header py-3">
                            <FontAwesomeIcon icon={faChartLine} className="mr-2"/>
                            {t('Monthly Energy & Cost Trends')}
                        </CardTitle>
                        <CardBody>
                            <div style={{height: '400px'}}>
                                <Line data={monthlyTrendChartData} options={dualAxisOptions}/>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>

            {/* Top Stores & Energy Details */}
            <Row className="mb-4">
                <Col xl={6} lg={12} className="mb-3">
                    <Card className="shadow-sm h-100">
                        <CardTitle tag="h5" className="card-header py-3">
                            <FontAwesomeIcon icon={faStore} className="mr-2"/>
                            {t('Top 5 Energy Consuming Stores')}
                        </CardTitle>
                        <CardBody>
                            <div style={{height: '350px'}}>
                                <Bar
                                    data={topStoresChartData}
                                    options={{
                                        ...chartOptions,
                                        indexAxis: 'y',
                                        scales: {
                                            x: {
                                                beginAtZero: true,
                                                title: {
                                                    display: true,
                                                    text: t('Energy Consumption')
                                                }
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </CardBody>
                    </Card>
                </Col>

                <Col xl={6} lg={12} className="mb-3">
                    <Card className="shadow-sm h-100">
                        <CardTitle tag="h5" className="card-header py-3">
                            <FontAwesomeIcon icon={faBolt} className="mr-2"/>
                            {t('Energy Category Details')}
                        </CardTitle>
                        <CardBody>
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead className="thead-light">
                                    <tr>
                                        <th>{t('Category')}</th>
                                        <th className="text-right">{t('Consumption')}</th>
                                        <th className="text-right">{t('YoY Change')}</th>
                                        <th className="text-right">{t('Per m²')}</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {energyData.names?.map((name, index) => (
                                        <tr key={index}>
                                            <td>
                                                <strong>{name}</strong>
                                            </td>
                                            <td className="text-right">
                                                {energyData.subtotals?.[index]?.toFixed(2) || '0.00'} {energyData.units?.[index]}
                                            </td>
                                            <td className="text-right">
                                                <Badge
                                                    color={energyData.increment_rates?.[index] >= 0 ? 'danger' : 'success'}>
                                                    <FontAwesomeIcon
                                                        icon={energyData.increment_rates?.[index] >= 0 ? faArrowUp : faArrowDown}
                                                        className="mr-1"
                                                    />
                                                    {Math.abs((energyData.increment_rates?.[index] || 0) * 100).toFixed(2)}%
                                                </Badge>
                                            </td>
                                            <td className="text-right">
                                                {energyData.subtotals_per_unit_area?.[index]?.toFixed(2) || '0.00'}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>

            {/* Store List with Progress Bars */}
            <Row>
                <Col>
                    <Card className="shadow-sm">
                        <CardTitle tag="h5" className="card-header py-3">
                            <FontAwesomeIcon icon={faStore} className="mr-2"/>
                            {t('Store Performance Overview')}
                        </CardTitle>
                        <CardBody>
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead className="thead-light">
                                    <tr>
                                        <th>{t('Store Name')}</th>
                                        <th>{t('Address')}</th>
                                        <th className="text-right">{t('Store Area')}(m²)</th>
                                        <th className="text-right">{t('Energy Consumption')}</th>
                                        <th style={{width: '200px'}}>{t('Usage Intensity')}</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {topStores.map((store, index) => (
                                        <tr key={store.id}>
                                            <td>
                                                <strong>{store.name}</strong>
                                                <Badge color="primary" className="ml-2">#{index + 1}</Badge>
                                            </td>
                                            <td className="text-muted">-</td>
                                            <td className="text-right">-</td>
                                            <td className="text-right">
                                                <strong>{store.total_energy.toFixed(2)}</strong>
                                            </td>
                                            <td>
                                                <Progress
                                                    value={Math.min((store.total_energy / (topStores[0]?.total_energy || 1)) * 100, 100)}
                                                    color={index === 0 ? 'danger' : index === 1 ? 'warning' : 'info'}
                                                    style={{height: '20px'}}
                                                >
                                                    {((store.total_energy / (topStores[0]?.total_energy || 1)) * 100).toFixed(1)}%
                                                </Progress>
                                            </td>
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
