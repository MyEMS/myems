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
    total_spaces: 0,
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

  const [topSpaces, setTopSpaces] = useState([]);
  const [allSpaces, setAllSpaces] = useState([]);
  const [expandedSpaces, setExpandedSpaces] = useState({}); // Track expanded spaces
  const [monthlyTrends, setMonthlyTrends] = useState({
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

      const response = await fetch(`${APIBaseURL}/reports/spacedashboard?${params}`, {
        method: 'GET',
        headers: {
          'Content-type': 'application/json',
          'User-UUID': user_uuid,
          Token: token
        }
      });

      // Handle 401 Unauthorized - Token expired or invalid
      if (response.status === 401) {
        // Clear invalid cookies
        document.cookie = 'is_logged_in=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'user_uuid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        
        // Redirect to login
        setRedirectUrl('/authentication/basic/login');
        setRedirect(true);
        
        throw new Error('Authentication required');
      }

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const json = await response.json();

      setSummary(json.summary || {});
      setEnergyData(json.reporting_period_input || {});
      setCostData(json.reporting_period_cost || {});
      setTopSpaces(json.top_spaces || []);
      setAllSpaces(json.spaces || []);

      // Process monthly trends
      if (json.reporting_period_input.timestamps && json.reporting_period_input.timestamps.length > 0) {
        const labels = json.reporting_period_input.timestamps[0] || [];
        const energyValues = json.reporting_period_input.values || [];
        const costValues = json.reporting_period_cost.values || [];
        const categoryNames = json.reporting_period_input.category_names || [];
        const categoryUnits = json.reporting_period_input.category_units || [];

        setMonthlyTrends({
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

      toast.success(t('Dashboard data loaded successfully'));
    } catch (error) {
      console.error('Error fetching space dashboard data:', error);
      toast.error(t('Failed to load dashboard data'));
    } finally {
      setLoading(false);
    }
  }, [periodType, basePeriodStart, basePeriodEnd, reportingPeriodStart, reportingPeriodEnd, t, setRedirect, setRedirectUrl]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // OPTIMIZED: Low-frequency login status check (every 30 minutes instead of every 1 second)
  // The primary authentication check is now handled by authenticatedFetch which intercepts 401 errors
  useEffect(() => {
    const CHECK_INTERVAL = 30 * 60 * 1000; // 30 minutes in milliseconds
    
    const timer = setInterval(() => {
      let is_logged_in = getCookieValue('is_logged_in');
      if (is_logged_in === null || !is_logged_in) {
        setRedirectUrl(`/authentication/basic/login`);
        setRedirect(true);
      }
    }, CHECK_INTERVAL);
    
    return () => clearInterval(timer);
  }, [setRedirect, setRedirectUrl]);

  // Prepare bar chart data for top spaces
  const prepareTopSpacesBarData = () => {
    const labels = topSpaces.map(space => space.name);
    const data = topSpaces.map(space => ({
      name: space.name,
      subtotal: space.total_energy,
      unit: 'kWh',
      increment_rate: null,
      subtotal_per_unit_area: 0,
      subtotal_per_capita: 0
    }));
    return {labels, data};
  };

  const topSpacesBarData = prepareTopSpacesBarData();

  // Prepare line chart data for monthly trends - now by energy category
  const prepareMonthlyTrendData = () => {
    const timestamps = {};
    const values = {};
    const options = [];

    if (monthlyTrends.labels && monthlyTrends.labels.length > 0) {
      // Add cost option first (as default)
      if (monthlyTrends.cost && monthlyTrends.cost.length > 0) {
        timestamps['cost'] = monthlyTrends.labels;
        values['cost'] = monthlyTrends.cost.length > 0 ? monthlyTrends.cost[0] : [];
        options.push({value: 'cost', label: t('CostData')});
      }
      
      // Add each energy category as a separate option
      monthlyTrends.energy.forEach((categoryData, index) => {
        const key = `energy_${index}`;
        timestamps[key] = monthlyTrends.labels;
        values[key] = categoryData;
        const categoryName = monthlyTrends.categoryNames[index] || t('Unknown');
        const unit = monthlyTrends.categoryUnits[index] || '';
        options.push({value: key, label: `${t(categoryName)} (${unit})`});
      });
    }

    return {timestamps, values, options};
  };

  const monthlyTrendChartData = prepareMonthlyTrendData();
  
  // Set default selected option to cost
  const [selectedChartOption, setSelectedChartOption] = useState('cost');

  // Build tree structure from flat space list
  const buildSpaceTree = () => {
    const spaceMap = {};
    const roots = [];

    // Create map of all spaces
    allSpaces.forEach(space => {
      spaceMap[space.id] = { ...space, children: [] };
    });

    // Build tree
    allSpaces.forEach(space => {
      if (space.parent_space_id && spaceMap[space.parent_space_id]) {
        spaceMap[space.parent_space_id].children.push(spaceMap[space.id]);
      } else {
        roots.push(spaceMap[space.id]);
      }
    });

    return roots;
  };

  // Toggle expand/collapse
  const toggleSpace = (spaceId) => {
    setExpandedSpaces(prev => ({
      ...prev,
      [spaceId]: !prev[spaceId]
    }));
  };

  // Render tree table rows recursively
  const renderSpaceTreeRows = (spaces, level = 0) => {
    let rows = [];

    spaces.forEach(space => {
      const hasChildren = space.children && space.children.length > 0;
      const isExpanded = expandedSpaces[space.id];
      const perArea = space.area > 0 ? 
        (space.total_energy / space.area).toFixed(2) : '0.00';

      // Main row
      rows.push(
        <tr key={space.id}>
          <td>
            <div style={{ paddingLeft: `${level * 24}px` }}>
              {hasChildren ? (
                <span 
                  onClick={() => toggleSpace(space.id)} 
                  style={{ cursor: 'pointer', marginRight: '8px' }}
                >
                  {isExpanded ? '▼' : '▶'}
                </span>
              ) : (
                <span style={{ marginRight: '8px', width: '16px', display: 'inline-block' }}></span>
              )}
              <strong>{space.name}</strong>
            </div>
          </td>
          <td className="text-right">{space.area ? space.area.toFixed(2) : '-'}</td>
          {energyData.energy_category_ids && energyData.energy_category_ids.map((ecId, index) => {
            const categoryEnergy = space.energy_by_category && space.energy_by_category[ecId] 
              ? space.energy_by_category[ecId] 
              : 0;
            return (
              <td key={index} className="text-right">
                {categoryEnergy > 0 ? categoryEnergy.toFixed(2) : '-'}
              </td>
            );
          })}
          <td className="text-right">{perArea}</td>
        </tr>
      );

      // Render children if expanded
      if (hasChildren && isExpanded) {
        rows = rows.concat(renderSpaceTreeRows(space.children, level + 1));
      }
    });

    return rows;
  };

  const spaceTree = buildSpaceTree();

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
      <div className="py-4">
        {/* Summary Cards - Using CardSummary component */}
        <div className="card-deck">
          <CardSummary
            rate={null}
            title={t('Total Spaces')}
            color="success"
            footnote={t('Active Meters')}
            footvalue={summary.total_meters || 0}
            footunit=""
            secondfootnote={t('Total Area')}
            secondfootvalue={summary.total_area || 0}
            secondfootunit="m²"
          >
            <CountUp end={summary.total_spaces || 0} duration={2} separator="," />
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
            secondfootnote={''}
            secondfootvalue={0}
            secondfootunit=""
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
            secondfootnote={''}
            secondfootvalue={0}
            secondfootunit=""
          >
            <CountUp
                end={(energyData.total_in_kgco2e || 0) / 1000}
                duration={2}
                separator=","
                decimals={2}
            />
          </CardSummary>
        </div>

        {/* Charts Row - Four charts using SharePie */}
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
            defaultOption={selectedChartOption}
          />
        </div>

        {/* Space Performance Overview Table */}
        <Row>
          <Col>
            <Card className="mb-3">
              <CardBody>
                <h5 className="mb-3">
                  <FontAwesomeIcon icon={faArrowUp} className="mr-2"/>
                  {t('Space Performance Overview')}
                </h5>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="thead-light">
                    <tr>
                      <th>{t('Space Name')}</th>
                      <th className="text-right">{t('Space Area')}(m²)</th>
                      {energyData.names && energyData.names.map((categoryName, index) => (
                        <th key={index} className="text-right">
                          {t(categoryName)} ({energyData.units[index] || ''})
                        </th>
                      ))}
                      <th className="text-right">{t('Per Unit Area')}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {renderSpaceTreeRows(spaceTree)}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

      </div>
    </Fragment>
  );
};

export default withRedirect(withTranslation()(Dashboard));
