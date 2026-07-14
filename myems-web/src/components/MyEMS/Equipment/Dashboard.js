import React, {Fragment, useEffect, useState, useCallback} from 'react';
import CountUp from 'react-countup';
import {Col, Row, Card, CardBody} from 'reactstrap';
import {toast} from 'react-toastify';
import {getCookieValue, createCookie, checkEmpty} from '../../../helpers/utils';
import { Link } from 'react-router-dom';
import withRedirect from '../../../hoc/withRedirect';
import {withTranslation} from 'react-i18next';
import moment from 'moment';
import {APIBaseURL, settings} from '../../../config';
import CardSummary from '../common/CardSummary';
import SharePie from '../common/SharePie';
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
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
  faArrowUp,
  faSort,
  faSortUp,
  faSortDown
} from '@fortawesome/free-solid-svg-icons';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

const Dashboard = ({setRedirect, setRedirectUrl, t}) => {
  const [loading, setLoading] = useState(true);
  const [periodType] = useState('monthly');

  // Date ranges
  const [reportingPeriodStart] = useState(
      moment().startOf('month')
  );
  const [reportingPeriodEnd] = useState(moment());
  const [basePeriodStart] = useState(
      moment().subtract(1, 'years').startOf('month')
  );
  const [basePeriodEnd] = useState(
      moment().subtract(1, 'years')
  );

  // Dashboard data
  const [summary, setSummary] = useState({
    total_equipments: 0,
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

  const [topEquipments, setTopEquipments] = useState([]);
  const [allEquipments, setAllEquipments] = useState([]);
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

  // Dynamic monthly consumption cards
  const [monthlyConsumptionCards, setMonthlyConsumptionCards] = useState([]);

  // Dynamic monthly output cards
  const [monthlyOutputCards, setMonthlyOutputCards] = useState([]);

  // Reporting period output data for table
  const [reportingPeriodOutput, setReportingPeriodOutput] = useState({
    names: [],
    units: [],
    energy_category_ids: []
  });

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

      const response = await fetch(`${APIBaseURL}/reports/equipmentdashboard?${params}`, {
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
      setTopEquipments(json.top_equipments || []);
      setAllEquipments(json.equipments || []);
      setReportingPeriodOutput(json.reporting_period_output || {
        names: [],
        units: [],
        energy_category_ids: []
      });

      // Process daily trends (from 1st of last month to now)
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
        item.color = '#' + (((1 << 24) * Math.random()) | 0).toString(16).padStart(6, '0');
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
        item.color = '#' + (((1 << 24) * Math.random()) | 0).toString(16).padStart(6, '0');
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
        item.color = '#' + (((1 << 24) * Math.random()) | 0).toString(16).padStart(6, '0');
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
        item.color = '#' + (((1 << 24) * Math.random()) | 0).toString(16).padStart(6, '0');
        tco2eArray.push(item);
      });
      setTco2ePieData(tco2eArray);

      // Process dynamic monthly consumption cards
      let consumptionCards = [];
      if (json.reporting_period_input.names && json.reporting_period_input.names.length > 0) {
        json.reporting_period_input.names.forEach((categoryName, index) => {
          let cardItem = {};
          cardItem.name = categoryName;
          cardItem.unit = json.reporting_period_input.units[index];
          cardItem.subtotal = json.reporting_period_input.subtotals[index];
          cardItem.increment_rate = json.reporting_period_input.increment_rates[index] !== undefined
              ? parseFloat(json.reporting_period_input.increment_rates[index] * 100).toFixed(2) + '%'
              : null;
          consumptionCards.push(cardItem);
        });
      }
      setMonthlyConsumptionCards(consumptionCards);

      // Process dynamic monthly output cards
      let outputCards = [];
      if (json.reporting_period_output && json.reporting_period_output.names && json.reporting_period_output.names.length > 0) {
        json.reporting_period_output.names.forEach((outputName, index) => {
          let cardItem = {};
          cardItem.name = outputName;
          cardItem.unit = json.reporting_period_output.units[index];
          cardItem.subtotal = json.reporting_period_output.subtotals[index];
          cardItem.increment_rate = json.reporting_period_output.increment_rates[index] !== undefined
              ? parseFloat(json.reporting_period_output.increment_rates[index] * 100).toFixed(2) + '%'
              : null;
          outputCards.push(cardItem);
        });
      }
      setMonthlyOutputCards(outputCards);

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

  // Get sorted equipments
  const getSortedEquipments = () => {
    if (!sortConfig.key) {
      return allEquipments.sort((a, b) => b.total_energy - a.total_energy);
    }

    const sortedEquipments = [...allEquipments];
    sortedEquipments.sort((a, b) => {
      let aValue, bValue;

      switch (sortConfig.key) {
        case 'id':
          aValue = a.id;
          bValue = b.id;
          break;
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'efficiency':
          aValue = a.efficiency !== null && a.efficiency !== undefined ? a.efficiency : -1;
          bValue = b.efficiency !== null && b.efficiency !== undefined ? b.efficiency : -1;
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
          if (sortConfig.key.startsWith('input_')) {
            const index = parseInt(sortConfig.key.split('_')[1]);
            const ecId = energyData.energy_category_ids && energyData.energy_category_ids[index];
            aValue = a.energy_by_category && a.energy_by_category[ecId] ? a.energy_by_category[ecId] : 0;
            bValue = b.energy_by_category && b.energy_by_category[ecId] ? b.energy_by_category[ecId] : 0;
          } else if (sortConfig.key.startsWith('output_')) {
            const index = parseInt(sortConfig.key.split('_')[1]);
            const ecId = reportingPeriodOutput.energy_category_ids && reportingPeriodOutput.energy_category_ids[index];
            aValue = a.output_by_category && a.output_by_category[ecId] ? a.output_by_category[ecId] : 0;
            bValue = b.output_by_category && b.output_by_category[ecId] ? b.output_by_category[ecId] : 0;
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

    return sortedEquipments;
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

  // Prepare line chart data for daily trends - by energy category
  const prepareDailyTrendData = () => {
    const timestamps = {};
    const values = {};
    const options = [];

    if (dailyTrends.labels && dailyTrends.labels.length > 0) {
      // Add each energy category as a separate option
      dailyTrends.energy.forEach((categoryData, index) => {
        const key = `energy_${index}`;
        timestamps[key] = dailyTrends.labels;
        values[key] = categoryData;
        const categoryName = dailyTrends.categoryNames[index] || t('Unknown');
        const unit = dailyTrends.categoryUnits[index] || '';
        options.push({value: key, label: `${t(categoryName)} (${unit})`});
      });

      // Add cost option
      if (dailyTrends.cost && dailyTrends.cost.length > 0) {
        timestamps['cost'] = dailyTrends.labels;
        // Sum all cost categories for each day
        const totalCost = dailyTrends.labels.map((_, dayIndex) => {
          return dailyTrends.cost.reduce((sum, costCategory) => {
            return sum + (costCategory[dayIndex] || 0);
          }, 0);
        });
        values['cost'] = totalCost;
        options.push({value: 'cost', label: t('CostData') + ' (CNY)'});
      }
    }

    return {timestamps, values, options};
  };

  const dailyTrendChartData = prepareDailyTrendData();

  // Set default selected option to cost
  const [selectedChartOption] = useState('cost');

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
        {/* Summary Cards */}
        <div className="card-deck">
          <CardSummary
              rate={null}
              title={t('Total Equipments')}
              color="success"
          >
            <CountUp end={summary.total_equipments || 0} duration={2} separator=","/>
          </CardSummary>

          {/* Dynamic Monthly Consumption Cards */}
          {monthlyConsumptionCards.map((cardItem, index) => (
              <CardSummary
                  key={index}
                  rate={cardItem.increment_rate}
                  title={t("This Month's Consumption CATEGORY VALUE UNIT", {
                    CATEGORY: t(cardItem.name),
                    VALUE: null,
                    UNIT: '(' + cardItem.unit + ')'
                  })}
                  color="success"
              >
                <CountUp
                    end={cardItem.subtotal || 0}
                    duration={2}
                    separator=","
                    decimals={2}
                />
              </CardSummary>
          ))}

          {/* Dynamic Monthly Output Cards */}
          {monthlyOutputCards.map((cardItem, index) => (
              <CardSummary
                  key={`output-${index}`}
                  rate={cardItem.increment_rate}
                  title={t("This Month's Generation CATEGORY VALUE UNIT", {
                    CATEGORY: t(cardItem.name),
                    VALUE: null,
                    UNIT: '(' + cardItem.unit + ')'
                  })}
                  color="info"
              >
                <CountUp
                    end={cardItem.subtotal || 0}
                    duration={2}
                    separator=","
                    decimals={2}
                />
              </CardSummary>
          ))}

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

        {/* Charts Row - Four pie charts */}
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

        {/* Equipment List Table */}
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
                        onClick={() => handleSort('id')}
                        style={{cursor: 'pointer'}}
                      >
                        {t('ID')}
                        <FontAwesomeIcon 
                          icon={sortConfig.key === 'id' ? (sortConfig.direction === 'asc' ? faSortUp : faSortDown) : faSort}
                          className="ml-1"
                        />
                      </th>
                      <th 
                        onClick={() => handleSort('name')}
                        style={{cursor: 'pointer'}}
                      >
                        {t('Equipment Name')}
                        <FontAwesomeIcon 
                          icon={sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? faSortUp : faSortDown) : faSort}
                          className="ml-1"
                        />
                      </th>
                      {energyData.names && energyData.names.map((categoryName, index) => (
                          <th 
                            key={`input-${index}`} 
                            className="text-right"
                            onClick={() => handleSort(`input_${index}`)}
                            style={{cursor: 'pointer'}}
                          >
                            {t(categoryName)} ({energyData.units[index] || ''})
                            <FontAwesomeIcon 
                              icon={sortConfig.key === `input_${index}` ? (sortConfig.direction === 'asc' ? faSortUp : faSortDown) : faSort}
                              className="ml-1"
                            />
                          </th>
                      ))}
                      {reportingPeriodOutput.names && reportingPeriodOutput.names.map((outputName, index) => (
                          <th 
                            key={`output-${index}`} 
                            className="text-right"
                            onClick={() => handleSort(`output_${index}`)}
                            style={{cursor: 'pointer'}}
                          >
                            {t(outputName)} ({reportingPeriodOutput.units[index] || ''})
                            <FontAwesomeIcon 
                              icon={sortConfig.key === `output_${index}` ? (sortConfig.direction === 'asc' ? faSortUp : faSortDown) : faSort}
                              className="ml-1"
                            />
                          </th>
                      ))}
                      <th 
                        className="text-right"
                        onClick={() => handleSort('efficiency')}
                        style={{cursor: 'pointer'}}
                      >
                        {t('Cumulative Efficiency')}
                        <FontAwesomeIcon 
                          icon={sortConfig.key === 'efficiency' ? (sortConfig.direction === 'asc' ? faSortUp : faSortDown) : faSort}
                          className="ml-1"
                        />
                      </th>
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
                    {getSortedEquipments()
                        .map((equipment) => {
                          return (
                              <tr key={equipment.id}>
                                <td>
                                  <strong>{equipment.id}</strong>
                                </td>
                                <td>
                                  <Link to={{ pathname: '/equipment/energycategory?uuid=' + equipment.uuid }} target="_blank">
                                    <strong>{equipment.name}</strong>
                                  </Link>
                                </td>
                                {energyData.energy_category_ids && energyData.energy_category_ids.map((ecId, index) => {
                                  const categoryEnergy = equipment.energy_by_category && equipment.energy_by_category[ecId]
                                      ? equipment.energy_by_category[ecId]
                                      : 0;
                                  return (
                                      <td key={`input-${index}`} className="text-right">
                                        {categoryEnergy > 0 ? categoryEnergy.toFixed(2) : '-'}
                                      </td>
                                  );
                                })}
                                {reportingPeriodOutput.energy_category_ids && reportingPeriodOutput.energy_category_ids.map((ecId, index) => {
                                  const categoryOutput = equipment.output_by_category && equipment.output_by_category[ecId]
                                      ? equipment.output_by_category[ecId]
                                      : 0;
                                  return (
                                      <td key={`output-${index}`} className="text-right">
                                        {categoryOutput > 0 ? categoryOutput.toFixed(2) : '-'}
                                      </td>
                                  );
                                })}
                                <td className="text-right">
                                  {equipment.efficiency !== null && equipment.efficiency !== undefined
                                      ? equipment.efficiency.toFixed(2) + '%'
                                      : '-'}
                                </td>
                                <td className="text-right">
                                  {equipment.total_cost !== null && equipment.total_cost !== undefined && equipment.total_cost > 0
                                      ? equipment.total_cost.toFixed(2)
                                      : '-'}
                                </td>
                                <td className="text-right">
                                  {equipment.total_carbon !== null && equipment.total_carbon !== undefined && equipment.total_carbon > 0
                                      ? equipment.total_carbon.toFixed(2)
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
