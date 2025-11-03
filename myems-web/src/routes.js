import { Trans } from 'react-i18next';

//  NOTE: if you changed names below, you must change names in i18n.js
export const dashboardRoutes = {
  name: 'Dashboard',
  to: '/dashboard',
  exact: true,
  icon: 'tachometer-alt'
};

export const spaceRoutes = {
  name: 'Space Data',
  to: '/space',
  icon: 'building',
  exact: true,
  children: [
    { to: '/space/energycategory', name: 'Energy Category Data' },
    { to: '/space/energyitem', name: 'Energy Item Data' },
    { to: '/space/carbon', name: 'Carbon' },
    { to: '/space/cost', name: 'Cost' },
    { to: '/space/output', name: 'Output' },
    { to: '/space/income', name: 'Income' },
    { to: '/space/efficiency', name: 'Efficiency' },
    { to: '/space/load', name: 'Load' },
    { to: '/space/statistics', name: 'Statistics' },
    { to: '/space/saving', name: 'Saving' },
    { to: '/space/plan', name: 'Plan' },
    { to: '/space/prediction', name: 'Prediction' },
    { to: '/space/environmentmonitor', name: 'Environment Monitor' },
    { to: '/space/enterproduction', name: 'Enter Production' },
    { to: '/space/production', name: 'Space Production' }
  ]
};

export const equipmentRoutes = {
  name: 'Equipment Data',
  to: '/equipment',
  icon: 'cog',
  children: [
    { to: '/equipment/energycategory', name: 'Energy Category Data' },
    { to: '/equipment/energyitem', name: 'Energy Item Data' },
    { to: '/equipment/carbon', name: 'Carbon' },
    { to: '/equipment/cost', name: 'Cost' },
    { to: '/equipment/output', name: 'Output' },
    { to: '/equipment/income', name: 'Income' },
    { to: '/equipment/efficiency', name: 'Efficiency' },
    { to: '/equipment/load', name: 'Load' },
    { to: '/equipment/statistics', name: 'Statistics' },
    { to: '/equipment/saving', name: 'Saving' },
    { to: '/equipment/plan', name: 'Plan' },
    { to: '/equipment/batch', name: 'Batch Analysis' },
    { to: '/equipment/tracking', name: 'Equipment Tracking' },
    { to: '/equipment/comparison', name: 'Equipment Comparison' }
  ]
};

export const meterRoutes = {
  name: 'Meter Data',
  to: '/meter',
  icon: 'chart-pie',
  children: [
    { to: '/meter/meterenergy', name: 'Meter Energy' },
    { to: '/meter/metercarbon', name: 'Meter Carbon' },
    { to: '/meter/metercost', name: 'Meter Cost' },
    { to: '/meter/metertrend', name: 'Meter Trend' },
    { to: '/meter/meterrealtime', name: 'Meter Realtime' },
    { to: '/meter/metersaving', name: 'Meter Saving' },
    { to: '/meter/meterplan', name: 'Meter Plan' },
    { to: '/meter/metersubmetersbalance', name: 'Master Meter Submeters Balance' },
    { to: '/meter/meterbatch', name: 'Meter Batch Analysis' },
    { to: '/meter/metercomparison', name: 'Meter Comparison' },
    { to: '/meter/metertracking', name: 'Meter Tracking' },
    { to: '/meter/powerquality', name: 'Power Quality' },
    { to: '/meter/virtualmeterenergy', name: 'Virtual Meter Energy' },
    { to: '/meter/virtualmetercarbon', name: 'Virtual Meter Carbon' },
    { to: '/meter/virtualmetercost', name: 'Virtual Meter Cost' },
    { to: '/meter/virtualmeterbatch', name: 'Virtual Meter Batch Analysis' },
    { to: '/meter/virtualmetersaving', name: 'Virtual Meter Saving' },
    { to: '/meter/virtualmeterplan', name: 'Virtual Meter Plan' },
    { to: '/meter/virtualmetercomparison', name: 'Virtual Meter Comparison' },
    { to: '/meter/offlinemeterenergy', name: 'Offline Meter Energy' },
    { to: '/meter/offlinemetercarbon', name: 'Offline Meter Carbon' },
    { to: '/meter/offlinemetercost', name: 'Offline Meter Cost' },
    { to: '/meter/offlinemeterbatch', name: 'Offline Meter Batch Analysis' },
    { to: '/meter/offlinemetersaving', name: 'Offline Meter Saving' },
    { to: '/meter/offlinemeterplan', name: 'Offline Meter Plan' },
    { to: '/meter/offlinemeterinput', name: 'Offline Meter Input' }
  ]
};

export const tenantRoutes = {
  name: 'Tenant Data',
  to: '/tenant',
  icon: 'user',
  children: [
    { to: '/tenant/energycategory', name: 'Energy Category Data' },
    { to: '/tenant/energyitem', name: 'Energy Item Data' },
    { to: '/tenant/carbon', name: 'Carbon' },
    { to: '/tenant/cost', name: 'Cost' },
    { to: '/tenant/load', name: 'Load' },
    { to: '/tenant/statistics', name: 'Statistics' },
    { to: '/tenant/saving', name: 'Saving' },
    { to: '/tenant/plan', name: 'Plan' },
    { to: '/tenant/bill', name: 'Tenant Bill' },
    { to: '/tenant/batch', name: 'Batch Analysis' }
  ]
};

export const storeRoutes = {
  name: 'Store Data',
  to: '/store',
  icon: 'shopping-bag',
  children: [
    { to: '/store/energycategory', name: 'Energy Category Data' },
    { to: '/store/energyitem', name: 'Energy Item Data' },
    { to: '/store/carbon', name: 'Carbon' },
    { to: '/store/cost', name: 'Cost' },
    { to: '/store/load', name: 'Load' },
    { to: '/store/statistics', name: 'Statistics' },
    { to: '/store/saving', name: 'Saving' },
    { to: '/store/plan', name: 'Plan' },
    { to: '/store/batch', name: 'Batch Analysis' },
    { to: '/store/comparison', name: 'Store Comparison' }
  ]
};

export const shopfloorRoutes = {
  name: 'Shopfloor Data',
  to: '/shopfloor',
  icon: 'industry',
  children: [
    { to: '/shopfloor/energycategory', name: 'Energy Category Data' },
    { to: '/shopfloor/energyitem', name: 'Energy Item Data' },
    { to: '/shopfloor/carbon', name: 'Carbon' },
    { to: '/shopfloor/cost', name: 'Cost' },
    { to: '/shopfloor/load', name: 'Load' },
    { to: '/shopfloor/statistics', name: 'Statistics' },
    { to: '/shopfloor/saving', name: 'Saving' },
    { to: '/shopfloor/plan', name: 'Plan' },
    { to: '/shopfloor/batch', name: 'Batch Analysis' },
    { to: '/shopfloor/comparison', name: 'Shopfloor Comparison' }
  ]
};

export const combinedEquipmentRoutes = {
  name: 'Combined Equipment Data',
  to: '/combinedequipment',
  icon: 'cogs',
  children: [
    { to: '/combinedequipment/energycategory', name: 'Energy Category Data' },
    { to: '/combinedequipment/energyitem', name: 'Energy Item Data' },
    { to: '/combinedequipment/carbon', name: 'Carbon' },
    { to: '/combinedequipment/cost', name: 'Cost' },
    { to: '/combinedequipment/output', name: 'Output' },
    { to: '/combinedequipment/income', name: 'Income' },
    { to: '/combinedequipment/efficiency', name: 'Efficiency' },
    { to: '/combinedequipment/load', name: 'Load' },
    { to: '/combinedequipment/statistics', name: 'Statistics' },
    { to: '/combinedequipment/saving', name: 'Saving' },
    { to: '/combinedequipment/plan', name: 'Plan' },
    { to: '/combinedequipment/batch', name: 'Batch Analysis' },
    { to: '/combinedequipment/comparison', name: 'Combined Equipment Comparison' }
  ]
};

export const auxiliarySystemRoutes = {
  name: 'Auxiliary System',
  to: '/auxiliarysystem',
  icon: 'tv',
  children: [
    { to: '/auxiliarysystem/energyflowdiagram', name: 'Energy Flow Diagram' },
    { to: '/auxiliarysystem/distributionsystem', name: 'Distribution System' },
  ]
};


export const knowledgeBaseRoutes = {
  name: 'Knowledge Base',
  to: '/knowledgebase',
  exact: true,
  icon: 'folder'
};

export default [
  dashboardRoutes,
  spaceRoutes,
  equipmentRoutes,
  meterRoutes,
  tenantRoutes,
  storeRoutes,
  shopfloorRoutes,
  combinedEquipmentRoutes,
  auxiliarySystemRoutes,
  knowledgeBaseRoutes
];
