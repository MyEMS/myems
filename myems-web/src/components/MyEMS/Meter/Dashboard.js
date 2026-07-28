import React, { Fragment, useEffect, useState, useContext, useCallback } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  Col,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Media,
  Row,
  UncontrolledDropdown,
  Spinner,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane
} from 'reactstrap';
import CountUp from 'react-countup';
import moment from 'moment';
import loadable from '@loadable/component';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import Flex from '../../common/Flex';
import CardSummary from '../common/CardSummary';
import { getCookieValue, createCookie, checkEmpty, handleAPIError } from '../../../helpers/utils';
import withRedirect from '../../../hoc/withRedirect';
import { withTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { APIBaseURL, settings } from '../../../config';
import Appcontext from '../../../context/Context';
import blankPage from '../../../assets/img/generic/blank-page.png';

const MeterDashboard = ({ setRedirect, setRedirectUrl, t }) => {
  let current_moment = moment();
  useEffect(() => {
    let is_logged_in = getCookieValue('is_logged_in');
    let user_name = getCookieValue('user_name');
    let user_display_name = getCookieValue('user_display_name');
    let user_uuid = getCookieValue('user_uuid');
    let token = getCookieValue('token');
    if (checkEmpty(is_logged_in) || checkEmpty(token) || checkEmpty(user_uuid) || !is_logged_in) {
      setRedirectUrl(`/authentication/basic/login`);
      setRedirect(true);
    } else {
      createCookie('is_logged_in', true, settings.cookieExpireTime);
      createCookie('user_name', user_name, settings.cookieExpireTime);
      createCookie('user_display_name', user_display_name, settings.cookieExpireTime);
      createCookie('user_uuid', user_uuid, settings.cookieExpireTime);
      createCookie('token', token, settings.cookieExpireTime);
    }
  });

  useEffect(() => {
    let timer = setInterval(() => {
      let is_logged_in = getCookieValue('is_logged_in');
      if (is_logged_in === null || !is_logged_in) {
        setRedirectUrl(`/authentication/basic/login`);
        setRedirect(true);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [setRedirect, setRedirectUrl]);

  const [selectedSpaceID, setSelectedSpaceID] = useState(undefined);
  const [meterList, setMeterList] = useState([]);
  const [virtualMeterList, setVirtualMeterList] = useState([]);
  const [offlineMeterList, setOfflineMeterList] = useState([]);
  const [cascaderOptions, setCascaderOptions] = useState(undefined);
  const [activeTab, setActiveTab] = useState('1');

  const { language } = useContext(Appcontext);

  const [loading, setLoading] = useState(true);
  const [resultDataHidden, setResultDataHidden] = useState(true);

  const [meterCount, setMeterCount] = useState(0);
  const [virtualMeterCount, setVirtualMeterCount] = useState(0);
  const [offlineMeterCount, setOfflineMeterCount] = useState(0);

  const [tablePage, setTablePage] = useState(() => {
    if (typeof window === 'undefined') {
      return 1;
    }
    const saved = window.sessionStorage.getItem('metertracking_page');
    const parsed = Number.parseInt(saved, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  });
  const persistTablePage = useCallback(page => {
    const next = Math.max(1, Number.parseInt(page, 10) || 1);
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('metertracking_page', String(next));
    }
    setTablePage(next);
  }, []);

  const loadData = useCallback(
      (spaceId) => {
        if (!spaceId) return;

        setLoading(true);
        setResultDataHidden(true);

        const now = moment();
        const startDatetime = now.clone().startOf('month').format('YYYY-MM-DDTHH:mm:ss');
        const endDatetime = now.format('YYYY-MM-DDTHH:mm:ss');

        fetch(
            APIBaseURL +
            '/reports/meterdashboard?' +
            'spaceid=' + spaceId +
            '&energyCategory=all' +
            '&reportingperiodstartdatetime=' + startDatetime +
            '&reportingperiodenddatetime=' + endDatetime +
            '&language=' + language,
            {
              method: 'GET',
              headers: {
                'Content-type': 'application/json',
                'User-UUID': getCookieValue('user_uuid'),
                Token: getCookieValue('token')
              },
              body: null
            }
        )
            .then(response => {
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              return response.json();
            })
            .then(json => {
              let meters = [];
              json['meters'].forEach((currentValue, index) => {
                meters.push({
                  id: currentValue['id'],
                  uuid: currentValue['meter_uuid'],
                  name: currentValue['meter_name'],
                  space: currentValue['space_name'],
                  costcenter: currentValue['cost_center_name'],
                  energycategory: currentValue['energy_category_name'],
                  description: currentValue['description'],
                  startvalue: currentValue['start_value'],
                  endvalue: currentValue['end_value'],
                  differencevalue: currentValue['difference_value']
                });
              });
              setMeterList(meters);
              const totalPages = Math.max(1, Math.ceil(meters.length / 50));
              const nextPage = Math.min(tablePage || 1, totalPages);
              persistTablePage(nextPage);

              let virtualMeters = [];
              json['virtual_meters'].forEach((currentValue, index) => {
                virtualMeters.push({
                  id: currentValue['id'],
                  uuid: currentValue['virtual_meter_uuid'],
                  name: currentValue['virtual_meter_name'],
                  space: currentValue['space_name'],
                  costcenter: currentValue['cost_center_name'],
                  energycategory: currentValue['energy_category_name'],
                  description: currentValue['description'],
                  startvalue: currentValue['start_value'],
                  endvalue: currentValue['end_value'],
                  differencevalue: currentValue['difference_value']
                });
              });
              setVirtualMeterList(virtualMeters);

              let offlineMeters = [];
              json['offline_meters'].forEach((currentValue, index) => {
                offlineMeters.push({
                  id: currentValue['id'],
                  uuid: currentValue['offline_meter_uuid'],
                  name: currentValue['offline_meter_name'],
                  space: currentValue['space_name'],
                  costcenter: currentValue['cost_center_name'],
                  energycategory: currentValue['energy_category_name'],
                  description: currentValue['description'],
                  startvalue: currentValue['start_value'],
                  endvalue: currentValue['end_value'],
                  differencevalue: currentValue['difference_value']
                });
              });
              setOfflineMeterList(offlineMeters);

              setMeterCount(json['meter_count']);
              setVirtualMeterCount(json['virtual_meter_count']);
              setOfflineMeterCount(json['offline_meter_count']);

              setLoading(false);
              setResultDataHidden(false);
            })
            .catch(err => {
              console.error('Load data error:', err);
              setLoading(false);
              toast.error(t('Failed to load data. Please try again.'));
            });
      },
      [language, tablePage, persistTablePage, t]
  );

  useEffect(() => {
    let isResponseOK = false;
    fetch(APIBaseURL + '/spaces/tree', {
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
        'User-UUID': getCookieValue('user_uuid'),
        Token: getCookieValue('token')
      },
      body: null
    })
        .then(response => {
          if (response.ok) {
            isResponseOK = true;
          }
          return response.json();
        })
        .then(json => {
          if (isResponseOK) {
            json = JSON.parse(
                JSON.stringify([json])
                    .split('"id":')
                    .join('"value":')
                    .split('"name":')
                    .join('"label":')
            );
            setCascaderOptions(json);
            if (json[0]) {
              const defaultSpaceId = json[0].value;
              setSelectedSpaceID(defaultSpaceId);
              loadData(defaultSpaceId);
            } else {
              setSelectedSpaceID(undefined);
              setLoading(false);
            }
          } else {
            handleAPIError(json, setRedirect, setRedirectUrl, t, toast);
          }
        })
        .catch(err => {
          console.error('Get space tree error:', err);
          setLoading(false);
          toast.error(t('Failed to load space data.'));
        });
  }, [loadData, t, setRedirect, setRedirectUrl]);

  const DetailedDataTable = loadable(() => import('../common/DetailedDataTable'));

  const nameFormatter = (dataField, { name, uuid }) => (
      <Link to={{ pathname: '/meter/meterenergy?uuid=' + uuid }} target="_blank">
        <Media tag={Flex} align="center">
          <Media body className="ml-2">
            <h5 className="mb-0 fs--1">{name}</h5>
          </Media>
        </Media>
      </Link>
  );

  const actionFormatter = (dataField, { id }) => (
      <UncontrolledDropdown>
        <DropdownToggle color="link" size="sm" className="text-600 btn-reveal mr-3">
          <FontAwesomeIcon icon="ellipsis-h" className="fs--1" />
        </DropdownToggle>
        <DropdownMenu right className="border py-2">
          <DropdownItem onClick={() => console.log('Edit: ', id)}>{t('Edit Meter')}</DropdownItem>
        </DropdownMenu>
      </UncontrolledDropdown>
  );

  const baseColumns = [
    {
      dataField: 'id',
      headerClasses: 'border-0',
      text: t('ID'),
      classes: 'border-0 py-2 align-middle',
      sort: true
    },
    {
      dataField: 'name',
      headerClasses: 'border-0',
      text: t('Name'),
      classes: 'border-0 py-2 align-middle',
      formatter: nameFormatter,
      sort: true
    },
    {
      dataField: 'space',
      headerClasses: 'border-0',
      text: t('Space'),
      classes: 'border-0 py-2 align-middle',
      sort: true
    },
    {
      dataField: 'costcenter',
      headerClasses: 'border-0',
      text: t('Cost Center'),
      classes: 'border-0 py-2 align-middle',
      sort: true
    },
    {
      dataField: 'energycategory',
      headerClasses: 'border-0',
      text: t('Energy Category'),
      classes: 'border-0 py-2 align-middle',
      sort: true
    },
    {
      dataField: 'description',
      headerClasses: 'border-0',
      text: t('Description'),
      classes: 'border-0 py-2 align-middle',
      sort: true
    }
  ];

  const meterColumns = [
    ...baseColumns,
    {
      dataField: 'startvalue',
      headerClasses: 'border-0',
      text: `${t('This Month')}${t('Start Value')}`,
      classes: 'border-0 py-2 align-middle',
      sort: true
    },
    {
      dataField: 'endvalue',
      headerClasses: 'border-0',
      text: `${t('This Month')}${t('End Value')}`,
      classes: 'border-0 py-2 align-middle',
      sort: true
    },
    {
      dataField: 'differencevalue',
      headerClasses: 'border-0',
      text: t('Difference Value'),
      classes: 'border-0 py-2 align-middle',
      sort: true
    }
  ];

  const virtualOfflineColumns = baseColumns;

  const getColumnsForTab = (tabId) => {
    if (tabId === '1') {
      return meterColumns;
    } else {
      return virtualOfflineColumns;
    }
  };

  return (
      <Fragment>
        <Spinner color="primary" hidden={!loading} />
        <div
            className="blank-page-image-container"
            style={{ visibility: resultDataHidden ? 'visible' : 'hidden', display: resultDataHidden ? '' : 'none' }}
        >
          <img className="img-fluid" src={blankPage} alt="" />
        </div>
        <div style={{ visibility: resultDataHidden ? 'hidden' : 'visible', display: resultDataHidden ? 'none' : '' }}>
          <div className="card-deck">
            <CardSummary title={t('Meter Count')} color="success">
              <CountUp end={meterCount} duration={2} prefix="" separator="," decimals={0} decimal="." />
            </CardSummary>
            <CardSummary title={t('Virtual Meter Count')} color="info">
              <CountUp end={virtualMeterCount} duration={2} prefix="" separator="," decimals={0} decimal="." />
            </CardSummary>
            <CardSummary title={t('Offline Meter Count')} color="warning">
              <CountUp end={offlineMeterCount} duration={2} prefix="" separator="," decimals={0} decimal="." />
            </CardSummary>
          </div>

          <Nav tabs className="mt-3">
            <NavItem>
              <NavLink
                  className={activeTab === '1' ? 'active' : ''}
                  onClick={() => { setActiveTab('1'); }}
              >
                {t('Meter List')}
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                  className={activeTab === '2' ? 'active' : ''}
                  onClick={() => { setActiveTab('2'); }}
              >
                {t('Virtual Meter List')}
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                  className={activeTab === '3' ? 'active' : ''}
                  onClick={() => { setActiveTab('3'); }}
              >
                {t('Offline Meter List')}
              </NavLink>
            </NavItem>
          </Nav>

          <TabContent activeTab={activeTab} className="mt-3">
            <TabPane tabId="1">
              <DetailedDataTable
                  data={meterList}
                  title={t('Meter List')}
                  columns={getColumnsForTab('1')}
                  pagesize={50}
                  page={tablePage}
                  onChangePage={persistTablePage}
              />
            </TabPane>
            <TabPane tabId="2">
              <DetailedDataTable
                  data={virtualMeterList}
                  title={t('Virtual Meter List')}
                  columns={getColumnsForTab('2')}
                  pagesize={50}
                  page={tablePage}
                  onChangePage={persistTablePage}
              />
            </TabPane>
            <TabPane tabId="3">
              <DetailedDataTable
                  data={offlineMeterList}
                  title={t('Offline Meter List')}
                  columns={getColumnsForTab('3')}
                  pagesize={50}
                  page={tablePage}
                  onChangePage={persistTablePage}
              />
            </TabPane>
          </TabContent>
        </div>
      </Fragment>
  );
};

export default withTranslation()(withRedirect(MeterDashboard));