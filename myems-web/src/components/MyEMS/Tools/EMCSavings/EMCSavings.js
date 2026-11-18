import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardBody, Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import classNames from 'classnames';
import FalconCardHeader from '../../../common/FalconCardHeader';
import { getCookieValue, createCookie, checkEmpty } from '../../../../helpers/utils';
import withRedirect from '../../../../hoc/withRedirect';
import { withTranslation } from 'react-i18next';
import { settings } from '../../../../config';
import {
  MAX_DIRECT_ROWS,
  MAX_PRICE_SEGMENTS,
  MAX_REGRESSION_TERMS,
  MAX_SHARING_STAGES,
  MAX_VARIABLES,
  MIN_CONTRACT_TERM,
  MAX_CONTRACT_TERM,
  findVariety,
  formatNumber,
  toInteger,
} from './constants';
import { calculateSavings } from './savings';
import { buildSchedule } from './sharing';
import { buildFinancialModel } from './finance';
import SavingsPanel from './components/SavingsPanel';
import SharingPanel from './components/SharingPanel';
import FinancePanel from './components/FinancePanel';
import ReferencePanel from './components/ReferencePanel';

// Three tabs, one direction of data flow: savings -> distribution -> finance
// (dev plan 5.4). The tabs are joined by the bring buttons only, so every panel
// can still be edited on its own.
const TABS = [
  { id: 'savings', labelKey: 'Savings Verification' },
  { id: 'sharing', labelKey: 'Benefit Sharing' },
  { id: 'finance', labelKey: 'Financial Evaluation' },
];

const DEFAULT_TERM = 5;

// Row templates of the editable tables. A fresh copy is taken on every add so
// no two rows ever share one object (the panels are fully controlled).
const ROW_TEMPLATES = {
  variables: { name: '', pb: '', pr: '' },
  terms: { beta: '', x: '' },
  directRows: { eoff: '', tau: '' },
  stages: { start: '', end: '', ratio: '' },
  priceSegments: { share: '', price: '' },
};

const ROW_LIMITS = {
  variables: MAX_VARIABLES,
  terms: MAX_REGRESSION_TERMS,
  directRows: MAX_DIRECT_ROWS,
  stages: MAX_SHARING_STAGES,
  priceSegments: MAX_PRICE_SEGMENTS,
};

// Defaults of dev plan 5.5: electricity, ratio method, sharing mode, fixed
// agreed price, no growth, five year term, 8 percent discount rate, CNY.
const defaultSavingsForm = () => ({
  varietyId: 'ELECTRICITY',
  method: 'RATIO',
  eb: '',
  er: '',
  am: '',
  manualEab: '',
  beta0: '',
  variables: [{ ...ROW_TEMPLATES.variables }],
  terms: [{ ...ROW_TEMPLATES.terms }],
  directRows: [{ ...ROW_TEMPLATES.directRows }],
  reportCo2: false,
  co2Factor: '',
});

const defaultSharingForm = () => ({
  mode: 'SHARING',
  basis: 'FIXED_PRICE',
  term: String(DEFAULT_TERM),
  currency: 'CNY',
  price: String(findVariety('ELECTRICITY').referencePrice),
  growth: '0',
  customerExtraOm: '0',
  servicePrice: String(findVariety('ELECTRICITY').referencePrice),
  excessRatio: '50',
  baseCost: '',
  hostingFee: '',
  hostingOm: '0',
  retrofitCost: '0',
  amortYears: String(DEFAULT_TERM),
  weightedOpen: false,
  priceSegments: [{ ...ROW_TEMPLATES.priceSegments }],
  stages: [
    { start: '1', end: '3', ratio: '80' },
    { start: '4', end: '5', ratio: '60' },
  ],
  savings: new Array(DEFAULT_TERM).fill(''),
  yearlyPrices: new Array(DEFAULT_TERM).fill(''),
  guaranteed: new Array(DEFAULT_TERM).fill(''),
  actualCosts: new Array(DEFAULT_TERM).fill(''),
});

const defaultFinanceForm = () => ({
  investment: '',
  investmentOwner: 'ESCO',
  investmentSplit: '50',
  constructionYears: '0',
  escoOm: '0',
  customerOm: '0',
  discountRate: '8',
  overrides: { esco: {}, customer: {} },
});

// Year by year series are padded / truncated to the contract term so a term
// change never leaves orphan rows behind, and empty years stay empty.
const ensureSeries = (list, length, fill = '') => {
  const source = Array.isArray(list) ? list : [];
  const next = [];
  for (let index = 0; index < length; index += 1) {
    const value = source[index];
    next.push(value === undefined || value === null ? fill : value);
  }
  return next;
};

const EMCSavings = ({ setRedirect, setRedirectUrl, t }) => {
  const [activeTab, setActiveTab] = useState('savings');
  const [savingsForm, setSavingsForm] = useState(defaultSavingsForm);
  const [sharingForm, setSharingForm] = useState(defaultSharingForm);
  const [financeForm, setFinanceForm] = useState(defaultFinanceForm);
  const [referenceOpen, setReferenceOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const copyTimer = useRef(null);
  // Each cross tab bring happens automatically once, then it is manual only
  // (plan 5.4), so user edits of the second tab are never overwritten.
  const broughtSharing = useRef(false);
  const broughtFinance = useRef(null);

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
  }, [setRedirect, setRedirectUrl]);

  // Drop the pending "Copied" reset if the page unmounts within the 2s window.
  useEffect(
    () => () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    },
    []
  );

  // The table row count follows the typed contract term, but only while the
  // term itself is valid; an out of range term is reported by the kernel.
  const termParsed = useMemo(() => toInteger(sharingForm.term), [sharingForm.term]);
  const termCount =
    !termParsed.error &&
    termParsed.value >= MIN_CONTRACT_TERM &&
    termParsed.value <= MAX_CONTRACT_TERM
      ? termParsed.value
      : DEFAULT_TERM;

  // The panel and the kernel always see the same padded series, so the table
  // rows and the calculated rows can never disagree.
  const sharingView = useMemo(() => {
    const clone = { ...sharingForm };
    ['savings', 'yearlyPrices', 'guaranteed', 'actualCosts'].forEach(key => {
      clone[key] = ensureSeries(sharingForm[key], termCount);
    });
    return clone;
  }, [sharingForm, termCount]);

  // Everything below is derived, never stored: results can not go stale.
  const savingsResult = useMemo(() => calculateSavings(savingsForm), [savingsForm]);
  const savingsValue = savingsResult && savingsResult.es;
  const savingsReady = Number.isFinite(savingsValue) && savingsValue > 0;
  // Plan 5.1.4: a fully computed Es of zero or less blocks tabs 2 and 3.
  const noSavings = Number.isFinite(savingsValue) && savingsValue <= 0;

  const schedule = useMemo(
    () => (noSavings ? null : buildSchedule(sharingView)),
    [noSavings, sharingView]
  );

  const model = useMemo(
    () =>
      !schedule || schedule.blocked
        ? null
        : buildFinancialModel(financeForm, { term: schedule.term, rows: schedule.rows }),
    [schedule, financeForm]
  );

  const handleSavingsChange = (field, value) => {
    setSavingsForm(previous => ({ ...previous, [field]: value }));
    if (field === 'varietyId') {
      // The unit price default tracks the energy variety while it still is the
      // untouched reference price (plan 6.3).
      const previousReference = findVariety(savingsForm.varietyId).referencePrice;
      const nextReference = findVariety(value).referencePrice;
      setSharingForm(previous =>
        previous.price === '' || Number(previous.price) === previousReference
          ? { ...previous, price: String(nextReference), servicePrice: String(nextReference) }
          : previous
      );
    }
  };

  const handleSharingChange = (field, value) => {
    setSharingForm(previous => ({ ...previous, [field]: value }));
    if (field === 'mode') {
      // GB/T 24915 annex B: under a savings guarantee the customer is the
      // investor, so the finance tab defaults to the customer view (plan 5.2.3).
      setFinanceForm(previous => ({
        ...previous,
        investmentOwner: value === 'GUARANTEED' ? 'CUSTOMER' : 'ESCO',
        overrides: { esco: {}, customer: {} },
      }));
    }
  };

  const handleFinanceChange = (field, value) =>
    setFinanceForm(previous => ({ ...previous, [field]: value }));

  const changeRow = (setter, tableKey, index, field, value) =>
    setter(previous => ({
      ...previous,
      [tableKey]: previous[tableKey].map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row
      ),
    }));

  const addRow = (setter, tableKey) =>
    setter(previous =>
      previous[tableKey].length >= ROW_LIMITS[tableKey]
        ? previous
        : { ...previous, [tableKey]: [...previous[tableKey], { ...ROW_TEMPLATES[tableKey] }] }
    );

  const removeRow = (setter, tableKey, index) =>
    setter(previous =>
      previous[tableKey].length <= 1
        ? previous
        : {
            ...previous,
            [tableKey]: previous[tableKey].filter((_, rowIndex) => rowIndex !== index),
          }
    );

  const handleSeriesChange = (tableKey, index, value) =>
    setSharingForm(previous => {
      const next = ensureSeries(previous[tableKey], termCount);
      next[index] = value;
      return { ...previous, [tableKey]: next };
    });

  // Manual bring overwrites the year cells, the automatic first visit only
  // fills the empty ones, so a user edit is never thrown away.
  const bringSavingsIntoSharing = overwrite => {
    if (!savingsReady) return;
    const text = formatNumber(savingsValue);
    setSharingForm(previous => ({
      ...previous,
      savings: ensureSeries(previous.savings, termCount).map(value =>
        overwrite || value === '' || value == null ? text : value
      ),
    }));
    broughtSharing.current = true;
  };

  const bringScheduleIntoFinance = () => {
    setFinanceForm(previous => ({ ...previous, overrides: { esco: {}, customer: {} } }));
    broughtFinance.current = true;
  };

  const handleTabChange = tabId => {
    // First visit only fills the empty cells (plan 5.4), later visits leave the
    // user edits of this tab untouched.
    if (tabId === 'sharing' && !broughtSharing.current) bringSavingsIntoSharing(false);
    if (tabId === 'finance' && broughtFinance.current === null) bringScheduleIntoFinance();
    setActiveTab(tabId);
  };

  const handleBringToSharing = () => {
    // The explicit button always refreshes every year cell.
    bringSavingsIntoSharing(true);
    setActiveTab('sharing');
  };

  const handleBringToFinance = () => {
    bringScheduleIntoFinance();
    setActiveTab('finance');
  };

  // Only the formatted text is copied, the same string the cell shows (7.1).
  const handleCopy = ({ id, text }) => {
    const fallback = () => {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
      } catch (e) {
        console.error('Copy failed:', e);
      }
      document.body.removeChild(textarea);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(fallback);
    } else {
      fallback();
    }
    setCopiedKey(id);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="wrapper-content">
      <Nav tabs className="mb-3">
        {TABS.map(tab => (
          <NavItem key={tab.id} className="cursor-pointer">
            <NavLink
              className={classNames({ active: activeTab === tab.id })}
              onClick={() => handleTabChange(tab.id)}
            >
              <span className="fs--1 text-nowrap">{t(tab.labelKey)}</span>
            </NavLink>
          </NavItem>
        ))}
      </Nav>

      <TabContent activeTab={activeTab}>
        <TabPane tabId="savings">
          <Card>
            <FalconCardHeader
              title={t('Savings Verification')}
              titleClass="text-lightSlateGray mb-0"
            />
            <CardBody className="d-flex flex-column">
              <SavingsPanel
                t={t}
                form={savingsForm}
                result={savingsResult}
                onChange={handleSavingsChange}
                onRowChange={tableKey => (index, field, value) =>
                  changeRow(setSavingsForm, tableKey, index, field, value)}
                onRowAdd={tableKey => addRow(setSavingsForm, tableKey)}
                onRowRemove={(tableKey, index) => removeRow(setSavingsForm, tableKey, index)}
                onBring={handleBringToSharing}
                onReset={() => setSavingsForm(defaultSavingsForm())}
                copiedKey={copiedKey}
                onCopy={handleCopy}
              />
            </CardBody>
          </Card>
        </TabPane>

        <TabPane tabId="sharing">
          <Card>
            <FalconCardHeader title={t('Benefit Sharing')} titleClass="text-lightSlateGray mb-0" />
            <CardBody className="d-flex flex-column">
              <SharingPanel
                t={t}
                form={sharingView}
                varietyId={savingsForm.varietyId}
                schedule={schedule}
                noSavings={noSavings}
                onChange={handleSharingChange}
                onSeriesChange={tableKey => (index, value) =>
                  handleSeriesChange(tableKey, index, value)}
                onRowChange={tableKey => (index, field, value) =>
                  changeRow(setSharingForm, tableKey, index, field, value)}
                onRowAdd={tableKey => addRow(setSharingForm, tableKey)}
                onRowRemove={(tableKey, index) => removeRow(setSharingForm, tableKey, index)}
                onApplyPrice={value => handleSharingChange('price', String(value))}
                onBring={handleBringToFinance}
                onReset={() => setSharingForm(defaultSharingForm())}
                copiedKey={copiedKey}
                onCopy={handleCopy}
              />
            </CardBody>
          </Card>
        </TabPane>

        <TabPane tabId="finance">
          <Card>
            <FalconCardHeader
              title={t('Financial Evaluation')}
              titleClass="text-lightSlateGray mb-0"
            />
            <CardBody className="d-flex flex-column">
              <FinancePanel
                t={t}
                form={financeForm}
                currency={sharingForm.currency}
                schedule={schedule}
                model={model}
                noSavings={noSavings}
                onChange={handleFinanceChange}
                onOverrideChange={(viewKey, index, value) =>
                  setFinanceForm(previous => {
                    const next = { ...previous.overrides[viewKey] };
                    if (value === '' || value == null) delete next[index];
                    else next[index] = value;
                    return {
                      ...previous,
                      overrides: { ...previous.overrides, [viewKey]: next },
                    };
                  })
                }
                onBring={bringScheduleIntoFinance}
                onReset={() => setFinanceForm(defaultFinanceForm())}
                copiedKey={copiedKey}
                onCopy={handleCopy}
              />
            </CardBody>
          </Card>
        </TabPane>
      </TabContent>

      <Card className="mt-3">
        <CardBody>
          <ReferencePanel
            t={t}
            expanded={referenceOpen}
            onToggle={() => setReferenceOpen(previous => !previous)}
          />
        </CardBody>
      </Card>
    </div>
  );
};

export default withTranslation()(withRedirect(EMCSavings));
