import React, { Fragment, useEffect, useState, useContext, useCallback, useRef, useMemo } from 'react';
import {
    Row,
    Col,
    Spinner
} from 'reactstrap';
import CountUp from 'react-countup';
import moment from 'moment';
import loadable from '@loadable/component';
import CardSummary from '../common/CardSummary';
import MultiTrendChart from '../common/MultiTrendChart';
import MultipleLineChart from '../common/MultipleLineChart';
import SharePie from '../common/SharePie';
import { getCookieValue, createCookie, checkEmpty, handleAPIError } from '../../../helpers/utils';
import withRedirect from '../../../hoc/withRedirect';
import { withTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import DeepSeekAnalysisModal from '../common/DeepSeekAnalysisModal';
import { APIBaseURL, settings } from '../../../config';
import { v4 as uuid } from 'uuid';
import AppContext from '../../../context/Context';
import { useLocation } from 'react-router-dom';
import blankPage from '../../../assets/img/generic/blank-page.png';

const ChildSpacesTable = loadable(() => import('../common/ChildSpacesTable'));
const DetailedDataTable = loadable(() => import('../common/DetailedDataTable'));
const WorkingDaysConsumptionTable = loadable(() => import('../common/WorkingDaysConsumptionTable'));

const SpaceEnergyCategory = ({ setRedirect, setRedirectUrl, t }) => {
    const location = useLocation();
    const spaceUUID = location.search.split('=')[1];
    const { language } = useContext(AppContext);

    const defaultPeriodType = 'daily';

    const defaultDates = useMemo(() => {
        const now = moment();
        return {
            start: now.clone().startOf('month').toDate(),
            end: now.toDate()
        };
    }, []);

    const [loading, setLoading] = useState(true);
    const [resultDataHidden, setResultDataHidden] = useState(true);
    const [smartAnalysisOpen, setSmartAnalysisOpen] = useState(false);
    const [smartAnalysisContext, setSmartAnalysisContext] = useState(null);

    const [timeOfUseShareData, setTimeOfUseShareData] = useState([]);
    const [TCEShareData, setTCEShareData] = useState([]);
    const [TCO2EShareData, setTCO2EShareData] = useState([]);

    const [cardSummaryList, setCardSummaryList] = useState([]);
    const [totalInTCE, setTotalInTCE] = useState({});
    const [totalInTCO2E, setTotalInTCO2E] = useState({});
    const [childSpaceProportionList, setChildSpaceProportionList] = useState([]);

    const [spaceBaseAndReportingNames, setSpaceBaseAndReportingNames] = useState({ a0: '' });
    const [spaceBaseAndReportingUnits, setSpaceBaseAndReportingUnits] = useState({ a0: '()' });

    const [spaceBaseLabels, setSpaceBaseLabels] = useState({ a0: [] });
    const [spaceBaseData, setSpaceBaseData] = useState({ a0: [] });
    const [spaceBaseSubtotals, setSpaceBaseSubtotals] = useState({ a0: (0).toFixed(2) });

    const [spaceReportingLabels, setSpaceReportingLabels] = useState({ a0: [] });
    const [spaceReportingData, setSpaceReportingData] = useState({ a0: [] });
    const [spaceReportingSubtotals, setSpaceReportingSubtotals] = useState({ a0: (0).toFixed(2) });

    const [spaceReportingRates, setSpaceReportingRates] = useState({ a0: [] });
    const [spaceReportingOptions, setSpaceReportingOptions] = useState([]);

    const [parameterLineChartLabels, setParameterLineChartLabels] = useState([]);
    const [parameterLineChartData, setParameterLineChartData] = useState({});
    const [parameterLineChartOptions, setParameterLineChartOptions] = useState([]);

    const [detailedDataTableData, setDetailedDataTableData] = useState([]);
    const [detailedDataTableColumns, setDetailedDataTableColumns] = useState([
        { dataField: 'startdatetime', text: t('Datetime'), sort: true }
    ]);

    const [childSpacesTableData, setChildSpacesTableData] = useState([]);
    const [childSpacesTableColumns, setChildSpacesTableColumns] = useState([
        { dataField: 'id', text: t('ID'), sort: true },
        { dataField: 'name', text: t('Child Spaces'), sort: true }
    ]);

    const [workingDaysConsumptionTableData, setWorkingDaysConsumptionTableData] = useState([]);
    const [workingDaysConsumptionTableColumns, setWorkingDaysConsumptionTableColumns] = useState([
        { dataField: 'name', text: t('Energy Category'), sort: true }
    ]);

    const hasLoadedRef = useRef(false);

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
    }, []);

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

    const loadData = useCallback(
        (url, forceReload = false) => {
            if (hasLoadedRef.current && !forceReload) {
                return;
            }
            if (forceReload) {
                hasLoadedRef.current = false;
            }
            hasLoadedRef.current = true;

            setLoading(true);
            setResultDataHidden(true);

            fetch(url, {
                method: 'GET',
                headers: {
                    'Content-type': 'application/json',
                    'User-UUID': getCookieValue('user_uuid'),
                    Token: getCookieValue('token')
                },
                body: null
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(json => {
                    let cardSummaryArray = [];
                    json['reporting_period']['names'].forEach((currentValue, index) => {
                        let cardSummaryItem = {};
                        cardSummaryItem['name'] = json['reporting_period']['names'][index];
                        cardSummaryItem['unit'] = json['reporting_period']['units'][index];
                        cardSummaryItem['subtotal'] = json['reporting_period']['subtotals'][index];
                        cardSummaryItem['increment_rate'] =
                            parseFloat(json['reporting_period']['increment_rates'][index] * 100).toFixed(2) + '%';
                        cardSummaryItem['subtotal_per_unit_area'] = json['reporting_period']['subtotals_per_unit_area'][index];
                        cardSummaryItem['subtotal_per_capita'] = json['reporting_period']['subtotals_per_capita'][index];
                        cardSummaryArray.push(cardSummaryItem);
                    });
                    setCardSummaryList(cardSummaryArray);

                    let timeOfUseArray = [];
                    json['reporting_period']['energy_category_ids'].forEach((currentValue, index) => {
                        if (currentValue === 1) {
                            let timeOfUseItem = {};
                            timeOfUseItem['id'] = 1;
                            timeOfUseItem['name'] = t('Top-Peak');
                            timeOfUseItem['value'] = json['reporting_period']['toppeaks'][index];
                            timeOfUseItem['color'] = '#' + (((1 << 24) * Math.random()) | 0).toString(16);
                            timeOfUseArray.push(timeOfUseItem);

                            timeOfUseItem = {};
                            timeOfUseItem['id'] = 2;
                            timeOfUseItem['name'] = t('On-Peak');
                            timeOfUseItem['value'] = json['reporting_period']['onpeaks'][index];
                            timeOfUseItem['color'] = '#' + (((1 << 24) * Math.random()) | 0).toString(16);
                            timeOfUseArray.push(timeOfUseItem);

                            timeOfUseItem = {};
                            timeOfUseItem['id'] = 3;
                            timeOfUseItem['name'] = t('Mid-Peak');
                            timeOfUseItem['value'] = json['reporting_period']['midpeaks'][index];
                            timeOfUseItem['color'] = '#' + (((1 << 24) * Math.random()) | 0).toString(16);
                            timeOfUseArray.push(timeOfUseItem);

                            timeOfUseItem = {};
                            timeOfUseItem['id'] = 4;
                            timeOfUseItem['name'] = t('Off-Peak');
                            timeOfUseItem['value'] = json['reporting_period']['offpeaks'][index];
                            timeOfUseItem['color'] = '#' + (((1 << 24) * Math.random()) | 0).toString(16);
                            timeOfUseArray.push(timeOfUseItem);

                            timeOfUseItem = {};
                            timeOfUseItem['id'] = 5;
                            timeOfUseItem['name'] = t('Deep');
                            timeOfUseItem['value'] = json['reporting_period']['deeps'][index];
                            timeOfUseItem['color'] = '#' + (((1 << 24) * Math.random()) | 0).toString(16);
                            timeOfUseArray.push(timeOfUseItem);
                        }
                    });
                    setTimeOfUseShareData(timeOfUseArray);

                    let totalInTCE = {};
                    totalInTCE['value'] = json['reporting_period']['total_in_kgce'] / 1000;
                    totalInTCE['increment_rate'] =
                        parseFloat(json['reporting_period']['increment_rate_in_kgce'] * 100).toFixed(2) + '%';
                    totalInTCE['value_per_unit_area'] = json['reporting_period']['total_in_kgce_per_unit_area'];
                    totalInTCE['value_per_capita'] = json['reporting_period']['total_in_kgce_per_capita'];
                    setTotalInTCE(totalInTCE);

                    let totalInTCO2E = {};
                    totalInTCO2E['value'] = json['reporting_period']['total_in_kgco2e'] / 1000;
                    totalInTCO2E['increment_rate'] =
                        parseFloat(json['reporting_period']['increment_rate_in_kgco2e'] * 100).toFixed(2) + '%';
                    totalInTCO2E['value_per_unit_area'] = json['reporting_period']['total_in_kgco2e_per_unit_area'];
                    totalInTCO2E['value_per_capita'] = json['reporting_period']['total_in_kgco2e_per_capita'];
                    setTotalInTCO2E(totalInTCO2E);

                    let TCEDataArray = [];
                    json['reporting_period']['names'].forEach((currentValue, index) => {
                        let TCEDataItem = {};
                        TCEDataItem['id'] = index;
                        TCEDataItem['name'] = currentValue;
                        TCEDataItem['value'] = json['reporting_period']['subtotals_in_kgce'][index] / 1000;
                        TCEDataItem['color'] = '#' + (((1 << 24) * Math.random()) | 0).toString(16);
                        TCEDataArray.push(TCEDataItem);
                    });
                    setTCEShareData(TCEDataArray);

                    let TCO2EDataArray = [];
                    json['reporting_period']['names'].forEach((currentValue, index) => {
                        let TCO2EDataItem = {};
                        TCO2EDataItem['id'] = index;
                        TCO2EDataItem['name'] = currentValue;
                        TCO2EDataItem['value'] = json['reporting_period']['subtotals_in_kgco2e'][index] / 1000;
                        TCO2EDataItem['color'] = '#' + (((1 << 24) * Math.random()) | 0).toString(16);
                        TCO2EDataArray.push(TCO2EDataItem);
                    });
                    setTCO2EShareData(TCO2EDataArray);

                    let childSpaceProportionArray = [];
                    json['child_space']['energy_category_names'].forEach((currentValue, energyCategoryIndex) => {
                        if (json['child_space']['child_space_names_array'][energyCategoryIndex].length > 0) {
                            let childSpaceProportionItem = {};
                            childSpaceProportionItem['data'] = [];
                            json['child_space']['child_space_names_array'][energyCategoryIndex].forEach(
                                (currentSpaceName, spaceIndex) => {
                                    let childSpaceProportionItemDataItem = {};
                                    childSpaceProportionItemDataItem['id'] = spaceIndex;
                                    childSpaceProportionItemDataItem['name'] = currentSpaceName;
                                    childSpaceProportionItemDataItem['value'] =
                                        json['child_space']['subtotals_array'][energyCategoryIndex][spaceIndex];
                                    childSpaceProportionItemDataItem['color'] = '#' + (((1 << 24) * Math.random()) | 0).toString(16);
                                    childSpaceProportionItem['data'].push(childSpaceProportionItemDataItem);
                                }
                            );
                            childSpaceProportionItem['name'] = json['child_space']['energy_category_names'][energyCategoryIndex];
                            childSpaceProportionItem['unit'] = json['child_space']['units'][energyCategoryIndex];
                            childSpaceProportionArray.push(childSpaceProportionItem);
                        }
                    });
                    setChildSpaceProportionList(childSpaceProportionArray);

                    let base_timestamps = {};
                    json['base_period']['timestamps'].forEach((currentValue, index) => {
                        base_timestamps['a' + index] = currentValue;
                    });
                    setSpaceBaseLabels(base_timestamps);

                    let base_values = {};
                    json['base_period']['values'].forEach((currentValue, index) => {
                        base_values['a' + index] = currentValue;
                    });
                    setSpaceBaseData(base_values);

                    let base_and_reporting_names = {};
                    json['reporting_period']['names'].forEach((currentValue, index) => {
                        base_and_reporting_names['a' + index] = currentValue;
                    });
                    setSpaceBaseAndReportingNames(base_and_reporting_names);

                    let base_and_reporting_units = {};
                    json['reporting_period']['units'].forEach((currentValue, index) => {
                        base_and_reporting_units['a' + index] = '(' + currentValue + ')';
                    });
                    setSpaceBaseAndReportingUnits(base_and_reporting_units);

                    let base_subtotals = {};
                    json['base_period']['subtotals'].forEach((currentValue, index) => {
                        base_subtotals['a' + index] = currentValue.toFixed(2);
                    });
                    setSpaceBaseSubtotals(base_subtotals);

                    let reporting_timestamps = {};
                    json['reporting_period']['timestamps'].forEach((currentValue, index) => {
                        reporting_timestamps['a' + index] = currentValue;
                    });
                    setSpaceReportingLabels(reporting_timestamps);

                    let reporting_values = {};
                    json['reporting_period']['values'].forEach((currentValue, index) => {
                        reporting_values['a' + index] = currentValue;
                    });
                    setSpaceReportingData(reporting_values);

                    let reporting_subtotals = {};
                    json['reporting_period']['subtotals'].forEach((currentValue, index) => {
                        reporting_subtotals['a' + index] = currentValue.toFixed(2);
                    });
                    setSpaceReportingSubtotals(reporting_subtotals);

                    let rates = {};
                    json['reporting_period']['rates'].forEach((currentValue, index) => {
                        let currentRate = [];
                        currentValue.forEach(rate => {
                            currentRate.push(rate ? parseFloat(rate * 100).toFixed(2) : '0.00');
                        });
                        rates['a' + index] = currentRate;
                    });
                    setSpaceReportingRates(rates);

                    let options = [];
                    json['reporting_period']['names'].forEach((currentValue, index) => {
                        let unit = json['reporting_period']['units'][index];
                        options.push({ value: 'a' + index, label: currentValue + ' (' + unit + ')' });
                    });
                    setSpaceReportingOptions(options);

                    let timestamps = {};
                    json['parameters']['timestamps'].forEach((currentValue, index) => {
                        timestamps['a' + index] = currentValue;
                    });
                    setParameterLineChartLabels(timestamps);

                    let values = {};
                    json['parameters']['values'].forEach((currentValue, index) => {
                        values['a' + index] = currentValue;
                    });
                    setParameterLineChartData(values);

                    let names = [];
                    json['parameters']['names'].forEach((currentValue, index) => {
                        names.push({ value: 'a' + index, label: currentValue });
                    });
                    setParameterLineChartOptions(names);

                    let detailed_value_list = [];
                    if (json['reporting_period']['timestamps'].length > 0) {
                        json['reporting_period']['timestamps'][0].forEach((currentTimestamp, timestampIndex) => {
                            let detailed_value = {};
                            detailed_value['id'] = timestampIndex;
                            detailed_value['startdatetime'] = currentTimestamp;
                            json['reporting_period']['values'].forEach((currentValue, energyCategoryIndex) => {
                                detailed_value['a' + energyCategoryIndex] =
                                    json['reporting_period']['values'][energyCategoryIndex][timestampIndex];
                            });
                            detailed_value_list.push(detailed_value);
                        });
                    }

                    let detailed_value = {};
                    detailed_value['id'] = detailed_value_list.length;
                    detailed_value['startdatetime'] = t('Subtotal');
                    json['reporting_period']['subtotals'].forEach((currentValue, index) => {
                        detailed_value['a' + index] = currentValue;
                    });
                    detailed_value_list.push(detailed_value);
                    setDetailedDataTableData(detailed_value_list);

                    let detailed_column_list = [];
                    detailed_column_list.push({
                        dataField: 'startdatetime',
                        text: t('Datetime'),
                        sort: true
                    });
                    json['reporting_period']['names'].forEach((currentValue, index) => {
                        let unit = json['reporting_period']['units'][index];
                        detailed_column_list.push({
                            dataField: 'a' + index,
                            text: currentValue + ' (' + unit + ')',
                            sort: true,
                            formatter: function(decimalValue) {
                                if (typeof decimalValue === 'number') {
                                    return decimalValue.toFixed(2);
                                } else {
                                    return null;
                                }
                            }
                        });
                    });
                    setDetailedDataTableColumns(detailed_column_list);

                    let workding_days_table_column_list = [];
                    workding_days_table_column_list.push({
                        dataField: 'name',
                        text: t('Energy Category'),
                        sort: true
                    });
                    workding_days_table_column_list.push({
                        dataField: 'b0',
                        text: t('Reporting Period') + ' - ' + t('Working Days'),
                        sort: false,
                        formatter: function(decimalValue) {
                            if (typeof decimalValue === 'number') {
                                if (decimalValue === 0) {
                                    return '-';
                                }
                                return decimalValue.toFixed(2);
                            } else {
                                return decimalValue;
                            }
                        }
                    });
                    workding_days_table_column_list.push({
                        dataField: 'b1',
                        text: t('Reporting Period') + ' - ' + t('Non Working Days'),
                        sort: false,
                        formatter: function(decimalValue) {
                            if (typeof decimalValue === 'number') {
                                if (decimalValue === 0) {
                                    return '-';
                                }
                                return decimalValue.toFixed(2);
                            } else {
                                return decimalValue;
                            }
                        }
                    });
                    setWorkingDaysConsumptionTableColumns(workding_days_table_column_list);

                    let working_days_table_value_list = [];
                    json['reporting_period']['names'].forEach((currentValue, index) => {
                        let working_days_table_value = {};
                        let unit = json['reporting_period']['units'][index];
                        working_days_table_value['name'] = currentValue + ' (' + unit + ')';
                        working_days_table_value['b0'] =
                            json['space']['working_calendars'].length > 0
                                ? json['reporting_period']['working_days_subtotals'][index]
                                : '-';
                        working_days_table_value['b1'] =
                            json['space']['working_calendars'].length > 0
                                ? json['reporting_period']['non_working_days_subtotals'][index]
                                : '-';
                        working_days_table_value_list.push(working_days_table_value);
                    });
                    setWorkingDaysConsumptionTableData(working_days_table_value_list);

                    let child_space_value_list = [];
                    if (json['child_space']['child_space_names_array'].length > 0) {
                        json['child_space']['child_space_names_array'][0].forEach((currentSpaceName, spaceIndex) => {
                            let child_space_value = {};
                            child_space_value['id'] = json['child_space']['child_space_ids_array'][0][spaceIndex];
                            child_space_value['name'] = currentSpaceName;
                            json['child_space']['energy_category_names'].forEach((currentValue, energyCategoryIndex) => {
                                child_space_value['a' + 2 * energyCategoryIndex] =
                                    json['child_space']['subtotals_array'][energyCategoryIndex][spaceIndex];
                                let total = json['child_space']['subtotals_array'][energyCategoryIndex].reduce((a, b) => a + b);
                                child_space_value['a' + (2 * energyCategoryIndex + 1)] =
                                    total > 0
                                        ? (json['child_space']['subtotals_array'][energyCategoryIndex][spaceIndex] / total) * 100
                                        : 0.0;
                            });
                            child_space_value_list.push(child_space_value);
                        });
                    }
                    setChildSpacesTableData(child_space_value_list);

                    let child_space_column_list = [];
                    child_space_column_list.push({
                        dataField: 'id',
                        text: t('ID'),
                        sort: true
                    });
                    child_space_column_list.push({
                        dataField: 'name',
                        text: t('Child Spaces'),
                        sort: true
                    });
                    json['child_space']['energy_category_names'].forEach((currentValue, index) => {
                        let unit = json['child_space']['units'][index];
                        child_space_column_list.push({
                            dataField: 'a' + 2 * index,
                            text: currentValue + ' (' + unit + ')',
                            sort: true,
                            formatter: function(decimalValue) {
                                if (typeof decimalValue === 'number') {
                                    return decimalValue.toFixed(2);
                                } else {
                                    return null;
                                }
                            }
                        });
                        child_space_column_list.push({
                            dataField: 'a' + (2 * index + 1),
                            text: t('Percentage'),
                            sort: true,
                            formatter: function(decimalValue) {
                                if (typeof decimalValue === 'number') {
                                    return decimalValue.toFixed(2) + '%';
                                } else {
                                    return null;
                                }
                            }
                        });
                    });
                    setChildSpacesTableColumns(child_space_column_list);

                    setLoading(false);
                    setResultDataHidden(false);
                })
                .catch(err => {
                    console.error('Load data error:', err);
                    setLoading(false);
                    toast.error(t('Failed to load data. Please try again.'));
                });
        },
        [t]
    );

    const reload = useCallback(() => {
        const now = moment();
        const defaultStart = now.clone().startOf('month').toDate();
        const defaultEnd = now.toDate();

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
                    let spaceId;
                    if (spaceUUID && spaceUUID !== 'undefined' && spaceUUID !== 'null') {
                        spaceId = spaceUUID;
                    } else {
                        spaceId = json.id || json[0]?.id;
                    }

                    let url =
                        APIBaseURL +
                        '/reports/spaceenergycategory?' +
                        (spaceUUID && spaceUUID !== 'undefined' && spaceUUID !== 'null'
                            ? 'spaceuuid=' + spaceId
                            : 'spaceid=' + spaceId) +
                        '&periodtype=' + defaultPeriodType +
                        '&baseperiodstartdatetime=' +
                        '&baseperiodenddatetime=' +
                        '&reportingperiodstartdatetime=' +
                        moment(defaultStart).format('YYYY-MM-DDTHH:mm:ss') +
                        '&reportingperiodenddatetime=' +
                        moment(defaultEnd).format('YYYY-MM-DDTHH:mm:ss') +
                        '&language=' +
                        language;
                    loadData(url, true);
                } else {
                    handleAPIError(json, setRedirect, setRedirectUrl, t, toast);
                }
            })
            .catch(err => {
                console.error('Get space tree error:', err);
                setLoading(false);
                toast.error(t('Failed to load space data.'));
            });
    }, [spaceUUID, language, loadData, t, setRedirect, setRedirectUrl]);

    useEffect(() => {
        if (hasLoadedRef.current) {
            return;
        }

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
                    let spaceId;
                    if (spaceUUID && spaceUUID !== 'undefined' && spaceUUID !== 'null') {
                        spaceId = spaceUUID;
                    } else {
                        spaceId = json.id || json[0]?.id;
                    }

                    let url =
                        APIBaseURL +
                        '/reports/spaceenergycategory?' +
                        (spaceUUID && spaceUUID !== 'undefined' && spaceUUID !== 'null'
                            ? 'spaceuuid=' + spaceId
                            : 'spaceid=' + spaceId) +
                        '&periodtype=' + defaultPeriodType +
                        '&baseperiodstartdatetime=' +
                        '&baseperiodenddatetime=' +
                        '&reportingperiodstartdatetime=' +
                        moment(defaultDates.start).format('YYYY-MM-DDTHH:mm:ss') +
                        '&reportingperiodenddatetime=' +
                        moment(defaultDates.end).format('YYYY-MM-DDTHH:mm:ss') +
                        '&language=' +
                        language;
                    loadData(url);
                } else {
                    handleAPIError(json, setRedirect, setRedirectUrl, t, toast);
                }
            })
            .catch(err => {
                console.error('Get space tree error:', err);
                setLoading(false);
                toast.error(t('Failed to load space data.'));
            });
    }, [spaceUUID, language, defaultDates, loadData, t, setRedirect, setRedirectUrl]);

    const buildSmartAnalysisContext = useCallback(() => {
        const lineValues = {};
        if (parameterLineChartData && typeof parameterLineChartData === 'object') {
            Object.keys(parameterLineChartData).forEach(k => {
                const arr = parameterLineChartData[k];
                lineValues[k] = Array.isArray(arr) ? arr.slice(0, 200) : arr;
            });
        }
        return {
            reportType: 'space_energy_category',
            reportTitle: t('Energy Category Data'),
            periodType: defaultPeriodType,
            reportingPeriod: {
                start: moment(defaultDates.start).format('YYYY-MM-DDTHH:mm:ss'),
                end: moment(defaultDates.end).format('YYYY-MM-DDTHH:mm:ss')
            },
            cardSummaryList,
            totalInTCE,
            totalInTCO2E,
            timeOfUseShare: timeOfUseShareData,
            tceShare: TCEShareData,
            tco2eShare: TCO2EShareData,
            childSpaceProportion: childSpaceProportionList.slice(0, 80),
            detailedDataSample: detailedDataTableData.slice(0, 120),
            workingDaysConsumption: workingDaysConsumptionTableData,
            parameterLineChart: {
                labels: parameterLineChartLabels,
                optionLabels: parameterLineChartOptions,
                values: lineValues
            },
            spaceBaseAndReportingNames,
            spaceBaseAndReportingUnits
        };
    }, [
        defaultDates,
        cardSummaryList,
        totalInTCE,
        totalInTCO2E,
        timeOfUseShareData,
        TCEShareData,
        TCO2EShareData,
        childSpaceProportionList,
        detailedDataTableData,
        workingDaysConsumptionTableData,
        parameterLineChartLabels,
        parameterLineChartOptions,
        parameterLineChartData,
        spaceBaseAndReportingNames,
        spaceBaseAndReportingUnits,
        t
    ]);

    const openSmartAnalysis = () => {
        setSmartAnalysisContext(buildSmartAnalysisContext());
        setSmartAnalysisOpen(true);
    };

    return (
        <Fragment>
            {loading && (
                <div className="text-center py-5">
                    <Spinner color="primary" style={{ width: '3rem', height: '3rem' }} />
                    <p className="mt-3">{t('Loading data...')}</p>
                </div>
            )}

            <div
                className="blank-page-image-container"
                style={{
                    visibility: !loading && resultDataHidden ? 'visible' : 'hidden',
                    display: !loading && resultDataHidden ? '' : 'none'
                }}
            >
                <img className="img-fluid" src={blankPage} alt="" />
            </div>

            <div style={{
                visibility: !loading && !resultDataHidden ? 'visible' : 'hidden',
                display: !loading && !resultDataHidden ? '' : 'none'
            }}>
                <div className="mb-3 text-right">
                    {settings.enableAIAnalysis && (
                        <button
                            className="btn btn-falcon-default btn-sm"
                            onClick={openSmartAnalysis}
                        >
                            {t('AI Analysis')}
                        </button>
                    )}
                </div>

                <div className="card-deck">
                    {cardSummaryList.map(cardSummaryItem => (
                        <CardSummary
                            key={cardSummaryItem['name']}
                            rate={cardSummaryItem['increment_rate']}
                            title={t('Reporting Period Consumption CATEGORY UNIT', {
                                CATEGORY: cardSummaryItem['name'],
                                UNIT: '(' + cardSummaryItem['unit'] + ')'
                            })}
                            color="success"
                            footnote={t('Per Unit Area')}
                            footvalue={cardSummaryItem['subtotal_per_unit_area']}
                            footunit={'(' + cardSummaryItem['unit'] + '/M²)'}
                            secondfootnote={t('Per Capita')}
                            secondfootvalue={cardSummaryItem['subtotal_per_capita']}
                            secondfootunit={'(' + cardSummaryItem['unit'] + ')'}
                        >
                            {cardSummaryItem['subtotal'] && (
                                <CountUp
                                    end={cardSummaryItem['subtotal']}
                                    duration={2}
                                    prefix=""
                                    separator=","
                                    decimal="."
                                    decimals={2}
                                />
                            )}
                        </CardSummary>
                    ))}

                    {settings.showTCEData ? (
                        <CardSummary
                            rate={totalInTCE['increment_rate'] || ''}
                            title={t('Reporting Period Consumption CATEGORY UNIT', {
                                CATEGORY: t('Ton of Standard Coal'),
                                UNIT: '(TCE)'
                            })}
                            color="warning"
                            footnote={t('Per Unit Area')}
                            footvalue={totalInTCE['value_per_unit_area']}
                            footunit="(kgCE/M²)"
                            secondfootnote={t('Per Capita')}
                            secondfootvalue={totalInTCE['value_per_capita']}
                            secondfootunit="(kgCE)"
                        >
                            {totalInTCE['value'] && (
                                <CountUp end={totalInTCE['value']} duration={2} prefix="" separator="," decimal="." decimals={2} />
                            )}
                        </CardSummary>
                    ) : (
                        <></>
                    )}
                    <CardSummary
                        rate={totalInTCO2E['increment_rate'] || ''}
                        title={t('Reporting Period Consumption CATEGORY UNIT', {
                            CATEGORY: t('Ton of Carbon Dioxide Emissions'),
                            UNIT: '(TCO2E)'
                        })}
                        color="warning"
                        footnote={t('Per Unit Area')}
                        footvalue={totalInTCO2E['value_per_unit_area']}
                        footunit="(kgCO2E/M²)"
                        secondfootnote={t('Per Capita')}
                        secondfootvalue={totalInTCO2E['value_per_capita']}
                        secondfootunit="(kgCO2E)"
                    >
                        {totalInTCO2E['value'] && (
                            <CountUp end={totalInTCO2E['value']} duration={2} prefix="" separator="," decimal="." decimals={2} />
                        )}
                    </CardSummary>
                    <CardSummary
                        rate={
                            totalInTCE['value'] && totalInTCE['value'] !== 0 && totalInTCO2E['value']
                                ? ((totalInTCO2E['value'] / totalInTCE['value'] - 1) * 100).toFixed(2) + '%'
                                : '--'
                        }
                        title={t('Reporting Period Consumption CATEGORY UNIT', {
                            CATEGORY: t('Carbon Emissions Per Unit Of Energy Consumption'),
                            UNIT: '(TCO2E/TCE)'
                        })}
                        color="warning"
                        footnote={t('Per Unit Area')}
                        footvalue={
                            totalInTCE['value_per_unit_area'] &&
                            totalInTCE['value_per_unit_area'] !== 0 &&
                            totalInTCO2E['value_per_unit_area']
                                ? (totalInTCO2E['value_per_unit_area'] / totalInTCE['value_per_unit_area']).toFixed(3)
                                : '--'
                        }
                        footunit="(kgCO2E/kgCE/M²)"
                        secondfootnote={t('Per Capita')}
                        secondfootvalue={
                            totalInTCE['value_per_capita'] && totalInTCE['value_per_capita'] !== 0 && totalInTCO2E['value_per_capita']
                                ? (totalInTCO2E['value_per_capita'] / totalInTCE['value_per_capita']).toFixed(3)
                                : '--'
                        }
                        secondfootunit="(kgCO2E/kgCE)"
                    >
                        {totalInTCE['value'] && totalInTCE['value'] !== 0 && totalInTCO2E['value'] ? (
                            <CountUp
                                end={totalInTCO2E['value'] / totalInTCE['value']}
                                duration={2}
                                prefix=""
                                separator=","
                                decimal="."
                                decimals={3}
                            />
                        ) : (
                            '--'
                        )}
                    </CardSummary>
                </div>

                <Row noGutters>
                    <Col className="mb-3 pr-lg-2 mb-3">
                        <SharePie data={timeOfUseShareData} title={t('Electricity Consumption by Time-Of-Use')} />
                    </Col>
                    {settings.showTCEData ? (
                        <Col className="mb-3 pr-lg-2 mb-3">
                            <SharePie data={TCEShareData} title={t('Ton of Standard Coal by Energy Category')} />
                        </Col>
                    ) : (
                        <></>
                    )}
                    <Col className="mb-3 pr-lg-2 mb-3">
                        <SharePie data={TCO2EShareData} title={t('Ton of Carbon Dioxide Emissions by Energy Category')} />
                    </Col>
                    {childSpaceProportionList.map(childSpaceProportionItem => (
                        <Col className="mb-3 pr-lg-2 mb-3" key={uuid()}>
                            <SharePie
                                data={childSpaceProportionItem['data']}
                                title={t('Child Space Proportion CATEGORY UNIT', {
                                    CATEGORY: childSpaceProportionItem['name'],
                                    UNIT: '(' + childSpaceProportionItem['unit'] + ')'
                                })}
                            />
                        </Col>
                    ))}
                </Row>

                <MultiTrendChart
                    reportingTitle={{
                        name: 'Reporting Period Consumption CATEGORY VALUE UNIT',
                        substitute: ['CATEGORY', 'VALUE', 'UNIT'],
                        CATEGORY: spaceBaseAndReportingNames,
                        VALUE: spaceReportingSubtotals,
                        UNIT: spaceBaseAndReportingUnits
                    }}
                    baseTitle={{
                        name: 'Base Period Consumption CATEGORY VALUE UNIT',
                        substitute: ['CATEGORY', 'VALUE', 'UNIT'],
                        CATEGORY: spaceBaseAndReportingNames,
                        VALUE: spaceBaseSubtotals,
                        UNIT: spaceBaseAndReportingUnits
                    }}
                    reportingTooltipTitle={{
                        name: 'Reporting Period Consumption CATEGORY VALUE UNIT',
                        substitute: ['CATEGORY', 'VALUE', 'UNIT'],
                        CATEGORY: spaceBaseAndReportingNames,
                        VALUE: null,
                        UNIT: spaceBaseAndReportingUnits
                    }}
                    baseTooltipTitle={{
                        name: 'Base Period Consumption CATEGORY VALUE UNIT',
                        substitute: ['CATEGORY', 'VALUE', 'UNIT'],
                        CATEGORY: spaceBaseAndReportingNames,
                        VALUE: null,
                        UNIT: spaceBaseAndReportingUnits
                    }}
                    reportingLabels={spaceReportingLabels}
                    reportingData={spaceReportingData}
                    baseLabels={spaceBaseLabels}
                    baseData={spaceBaseData}
                    rates={spaceReportingRates}
                    options={spaceReportingOptions}
                />

                <MultipleLineChart
                    reportingTitle={t('Operating Characteristic Curve')}
                    baseTitle=""
                    labels={parameterLineChartLabels}
                    data={parameterLineChartData}
                    options={parameterLineChartOptions}
                    yAxisScale={true}
                />

                <WorkingDaysConsumptionTable
                    data={workingDaysConsumptionTableData}
                    columns={workingDaysConsumptionTableColumns}
                />
                <br />

                <DetailedDataTable
                    data={detailedDataTableData}
                    title={t('Detailed Data')}
                    columns={detailedDataTableColumns}
                    pagesize={50}
                />
                <br />

                <ChildSpacesTable
                    data={childSpacesTableData}
                    title={t('Child Spaces Data')}
                    columns={childSpacesTableColumns}
                />
            </div>

            {settings.enableAIAnalysis ? (
                <DeepSeekAnalysisModal
                    isOpen={smartAnalysisOpen}
                    toggle={() => setSmartAnalysisOpen(false)}
                    language={language}
                    reportContext={smartAnalysisContext}
                    setRedirect={setRedirect}
                    setRedirectUrl={setRedirectUrl}
                />
            ) : null}
        </Fragment>
    );
};

export default withTranslation()(withRedirect(SpaceEnergyCategory));