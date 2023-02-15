// import { version } from './config';
import { Trans } from 'react-i18next';

// export const homeRoutes = {
//   name: 'Home',
//   to: '/',
//   exact: true,
//   icon: 'chart-pie',
//   children: [
//     {
//       to: '/',
//       name: 'Dashboard',
//       exact: true
//     },
//     { to: '/dashboard-alt', name: 'Dashboard alt' },
//     { to: '/feed', name: 'Feed', exact: true },
//     { to: '/landing', name: 'Landing' }
//   ]
// };

// export const authenticationRoutes = {
//   name: 'Authentication',
//   to: '/authentication',
//   icon: 'lock',
//   children: [
//     {
//       to: '/authentication/basic',
//       name: 'Basic',
//       children: [
//         { to: '/authentication/basic/login', name: 'Login' },
//         { to: '/authentication/basic/logout', name: 'Logout' },
//         { to: '/authentication/basic/register', name: 'Register' },
//         { to: '/authentication/basic/forget-password', name: 'Forgot password' },
//         { to: '/authentication/basic/password-reset', name: 'Reset password' },
//         { to: '/authentication/basic/confirm-mail', name: 'Confirm mail' },
//         { to: '/authentication/basic/lock-screen', name: 'Lock screen' }
//       ]
//     },
//     {
//       to: '/authentication/card',
//       name: 'Card',
//       children: [
//         { to: '/authentication/card/login', name: 'Login' },
//         { to: '/authentication/card/logout', name: 'Logout' },
//         { to: '/authentication/card/register', name: 'Register' },
//         { to: '/authentication/card/forget-password', name: 'Forgot password' },
//         { to: '/authentication/card/password-reset', name: 'Reset password' },
//         { to: '/authentication/card/confirm-mail', name: 'Confirm mail' },
//         { to: '/authentication/card/lock-screen', name: 'Lock screen' }
//       ]
//     },
//     {
//       to: '/authentication/split',
//       name: 'Split',
//       children: [
//         { to: '/authentication/split/login', name: 'Login' },
//         { to: '/authentication/split/logout', name: 'Logout' },
//         { to: '/authentication/split/register', name: 'Register' },
//         { to: '/authentication/split/forget-password', name: 'Forgot password' },
//         { to: '/authentication/split/password-reset', name: 'Reset password' },
//         { to: '/authentication/split/confirm-mail', name: 'Confirm mail' },
//         { to: '/authentication/split/lock-screen', name: 'Lock screen' }
//       ]
//     },
//     {
//       to: '/authentication/wizard',
//       name: 'Wizard'
//     }
//   ]
// };

// export const ECommerceRoutes = {
//   name: 'E commerce',
//   to: '/e-commerce',
//   icon: 'cart-plus',
//   children: [
//     { to: '/e-commerce/products/list', name: 'Product list' },
//     { to: '/e-commerce/products/grid', name: 'Product grid' },
//     { to: '/e-commerce/product-details', name: 'Product details' },
//     { to: '/e-commerce/orders', name: 'Orders' },
//     { to: '/e-commerce/order-details', name: 'Order details' },
//     { to: '/e-commerce/customers', name: 'Customers' },
//     { to: '/e-commerce/shopping-cart', name: 'Shopping cart' },
//     { to: '/e-commerce/checkout', name: 'Checkout' },
//     { to: '/e-commerce/favourite-items', name: 'Favourite items' }
//   ]
// };

// export const pageRoutes = {
//   name: 'Pages',
//   to: '/pages',
//   icon: 'copy',
//   children: [
//     { to: '/pages/activity', name: 'Activity' },
//     { to: '/pages/associations', name: 'Associations' },
//     { to: '/pages/billing', name: 'Billing' },
//     { to: '/pages/customer-details', name: 'Customer details' },
//     { to: '/pages/event-detail', name: 'Event detail' },
//     { to: '/pages/event-create', name: 'Event create' },
//     { to: '/pages/events', name: 'Events' },
//     { to: '/pages/faq', name: 'Faq' },
//     { to: '/pages/invoice', name: 'Invoice' },
//     { to: '/pages/invite-people', name: 'Invite people' },
//     { to: '/pages/notifications', name: 'Notifications' },
//     { to: '/pages/people', name: 'People' },
//     { to: '/pages/pricing', name: 'Pricing' },
//     { to: '/pages/pricing-alt', name: 'Pricing alt' },
//     { to: '/pages/profile', name: 'Profile' },
//     { to: '/pages/settings', name: 'Settings' },
//     { to: '/pages/starter', name: 'Starter' },
//     {
//       to: '/errors',
//       name: 'Errors',
//       children: [{ to: '/errors/404', name: '404' }, { to: '/errors/500', name: '500' }]
//     }
//   ]
// };
// export const widgetsRoutes = {
//   name: 'Widgets',
//   to: '/widgets',
//   exact: true,
//   icon: 'poll'
// };

// export const calenderRoutes = {
//   name: 'Calendar',
//   to: '/calendar',
//   exact: true,
//   icon: 'calendar-alt'
// };

// export const chatRoutes = {
//   name: 'Chat',
//   to: '/chat',
//   exact: true,
//   icon: 'comments'
// };

// export const kanbanRoutes = {
//   name: 'Kanban',
//   to: '/kanban',
//   exact: true,
//   icon: ['fab', 'trello']
// };

// export const emailRoutes = {
//   name: 'Email',
//   to: '/email',
//   icon: 'envelope-open',
//   children: [
//     { to: '/email/inbox', name: 'Inbox' },
//     { to: '/email/email-detail', name: 'Email detail' },
//     { to: '/email/compose', name: 'Compose' }
//   ]
// };

// export const documentationRoutes = {
//   name: 'Documentation',
//   to: '/documentation',
//   exact: true,
//   icon: 'book'
// };

// export const changelogRoutes = {
//   name: 'ChangeLog',
//   to: '/changelog',
//   exact: true,
//   icon: 'code-branch',
//   badge: {
//     text: `v${version}`,
//     color: 'soft-primary'
//   }
// };

// export const componentRoutes = {
//   name: 'Components',
//   to: '/components',
//   icon: 'puzzle-piece',
//   children: [
//     { to: '/components/alerts', name: 'Alerts' },
//     { to: '/components/accordions', name: 'Accordions' },
//     { to: '/components/avatar', name: 'Avatar' },
//     { to: '/components/badges', name: 'Badges' },
//     { to: '/components/backgrounds', name: 'Backgrounds' },
//     { to: '/components/breadcrumb', name: 'Breadcrumb' },
//     { to: '/components/buttons', name: 'Buttons' },
//     { to: '/components/cards', name: 'Cards' },
//     {
//       to: '/components/cookie-notice',
//       name: 'Cookie notice'
//     },
//     { to: '/components/collapses', name: 'Collapses' },
//     {
//       to: '/components/carousel',
//       name: 'Carousel'
//     },
//     { to: '/components/dropdowns', name: 'Dropdowns' },
//     { to: '/components/forms', name: 'Forms' },
//     { to: '/components/listgroups', name: 'List groups' },
//     { to: '/components/modals', name: 'Modals' },
//     { to: '/components/navs', name: 'Navs' },

//     {
//       to: '/components',
//       name: 'Navbar',
//       children: [
//         { to: '/components/navbars', name: 'Default' },
//         {
//           to: '/components/navbar-vertical',
//           name: 'Vertical',
//           badge: {
//             text: 'New'
//           }
//         },
//         {
//           to: '/components/navbar-top',
//           name: 'Top'
//         }
//       ]
//     },
//     { to: '/components/pageheaders', name: 'Page headers' },
//     { to: '/components/paginations', name: 'Paginations' },
//     { to: '/components/popovers', name: 'Popovers' },
//     { to: '/components/progress', name: 'Progress' },
//     {
//       to: '/components/sidepanel',
//       name: 'Sidepanel'
//     },
//     {
//       to: '/components/spinners',
//       name: 'Spinners'
//     },

//     { to: '/components/tables', name: 'Tables' },
//     { to: '/components/tooltips', name: 'Tooltips' }
//   ]
// };

// export const pluginRoutes = {
//   name: 'Plugins',
//   to: '/plugins',
//   icon: 'plug',
//   children: [
//     { to: '/plugins/bulk-select', name: 'Bulk select' },
//     {
//       to: '/plugins/react-beautiful-dnd',
//       name: 'Beautiful DnD'
//     },
//     {
//       to: '/plugins',
//       name: 'Chart',
//       children: [{ to: '/plugins/chart', name: 'Chart Js' }, { to: '/plugins/echarts', name: 'Echarts' }]
//     },
//     { to: '/plugins/countup', name: 'Countup' },
//     { to: '/plugins/code-highlight', name: 'Code Highlight' },
//     { to: '/plugins/datetime', name: 'Datetime' },
//     { to: '/plugins/dropzone', name: 'Dropzone' },
//     { to: '/plugins/emoji-mart', name: 'Emoji Mart' },
//     { to: '/plugins/fontawesome', name: 'Fontawesome' },
//     { to: '/plugins/image-lightbox', name: 'Image lightbox' },
//     { to: '/plugins/lottie', name: 'Lottie' },
//     {
//       to: '/plugins',
//       name: 'Map',
//       children: [
//         { to: '/plugins/leaflet-map', name: 'Leaflet map' },
//         { to: '/plugins/google-map', name: 'Google map' },
//         { to: '/plugins/echart-map', name: 'Echart Map' }
//       ]
//     },
//     { to: '/plugins/plyr', name: 'Plyr' },
//     { to: '/plugins/progressbar', name: 'Progressbar' },
//     { to: '/plugins/react-hook-form', name: 'React Hook Form' },
//     {
//       to: '/plugins/react-bootstrap-table2',
//       name: 'BS Table2'
//     },
//     { to: '/plugins/select', name: 'Select' },
//     { to: '/plugins/slick-carousel', name: 'Slick Carousel' },
//     { to: '/plugins/scroll-bar', name: 'Scroll Bar' },
//     { to: '/plugins/toastify', name: 'Toastify' },
//     { to: '/plugins/typed', name: 'Typed' },
//     { to: '/plugins/wysiwyg', name: 'WYSIWYG editor' }
//   ]
// };

// export const utilityRoutes = {
//   name: 'Utilities',
//   to: '/utilities',
//   icon: ['fab', 'hotjar'],
//   children: [
//     { to: '/utilities/borders', name: 'Borders' },
//     { to: '/utilities/clearfix', name: 'Clearfix' },
//     { to: '/utilities/closeIcon', name: 'Close icon' },
//     { to: '/utilities/colors', name: 'Colors' },
//     { to: '/utilities/display', name: 'Display' },
//     { to: '/utilities/embed', name: 'Embed' },
//     { to: '/utilities/figures', name: 'Figures' },
//     { to: '/utilities/flex', name: 'Flex' },
//     { to: '/utilities/grid', name: 'Grid' },
//     { to: '/utilities/sizing', name: 'Sizing' },
//     { to: '/utilities/spacing', name: 'Spacing' },
//     { to: '/utilities/stretchedLink', name: 'Stretched link' },
//     { to: '/utilities/typography', name: 'Typography' },
//     { to: '/utilities/verticalAlign', name: 'Vertical align' },
//     { to: '/utilities/visibility', name: 'Visibility' }
//   ]
// };

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
    { to: '/space/saving', name: 'Saving' }
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
    { to: '/equipment/batch', name: 'Batch Analysis' },
    { to: '/equipment/tracking', name: 'Equipment Tracking' }
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
    { to: '/meter/metersubmetersbalance', name: 'Master Meter Submeters Balance' },
    { to: '/meter/meterbatch', name: 'Meter Batch Analysis' },
    { to: '/meter/metercomparison', name: 'Meter Comparison' },
    { to: '/meter/metertracking', name: 'Meter Tracking' },
    { to: '/meter/virtualmeterenergy', name: 'Virtual Meter Energy' },
    { to: '/meter/virtualmetercarbon', name: 'Virtual Meter Carbon' },
    { to: '/meter/virtualmetercost', name: 'Virtual Meter Cost' },
    { to: '/meter/virtualmeterbatch', name: 'Virtual Meter Batch Analysis' },
    { to: '/meter/virtualmetersaving', name: 'Virtual Meter Saving' },
    { to: '/meter/offlinemeterenergy', name: 'Offline Meter Energy' },
    { to: '/meter/offlinemetercarbon', name: 'Offline Meter Carbon' },
    { to: '/meter/offlinemetercost', name: 'Offline Meter Cost' },
    { to: '/meter/offlinemeterbatch', name: 'Offline Meter Batch Analysis' },
    { to: '/meter/offlinemetersaving', name: 'Offline Meter Saving' }
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
    { to: '/store/batch', name: 'Batch Analysis' }
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
    { to: '/shopfloor/batch', name: 'Batch Analysis' }
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
    { to: '/combinedequipment/batch', name: 'Batch Analysis' }
  ]
};

export const auxiliarySystemRoutes = {
  name: 'Auxiliary System',
  to: '/auxiliarysystem',
  icon: 'tv',
  children: [
    { to: '/auxiliarysystem/energyflowdiagram', name: 'Energy Flow Diagram' },
    { to: '/auxiliarysystem/distributionsystem', name: 'Distribution System' }
  ]
};

export const fddRoutes = {
  name: 'Fault Alarm',
  to: '/fdd',
  icon: 'bell',
};

export const monitoringRoutes = {
  name: 'Monitoring',
  to: '/monitoring',
  icon: 'eye',
  children: [
    { to: '/monitoring/spaceequipments', name: 'Space Equipments' },
    { to: '/monitoring/combinedequipments', name: 'Combined Equipments' },
    { to: '/monitoring/tenantequipments', name: 'Tenant Equipments' },
    { to: '/monitoring/storeequipments', name: 'Store Equipments' },
    { to: '/monitoring/shopfloorequipments', name: 'Shopfloor Equipments' }
  ]
};

export const advancedReportingRoutes = {
  name: 'Advanced Reporting',
  to: '/advancedreporting',
  exact: true,
  icon: 'book'
};

export const knowledgeBaseRoutes = {
  name: 'Knowledge Base',
  to: '/knowledgebase',
  exact: true,
  icon: 'folder'
};

export default [
  // homeRoutes,
  // pageRoutes,
  // chatRoutes,
  // kanbanRoutes,
  // calenderRoutes,
  // emailRoutes,
  // authenticationRoutes,
  // ECommerceRoutes,
  // widgetsRoutes,
  // componentRoutes,
  // utilityRoutes,
  // pluginRoutes,
  // documentationRoutes,
  // changelogRoutes,
  dashboardRoutes,
  spaceRoutes,
  equipmentRoutes,
  meterRoutes,
  tenantRoutes,
  storeRoutes,
  shopfloorRoutes,
  combinedEquipmentRoutes,
  auxiliarySystemRoutes,
  fddRoutes,
  monitoringRoutes,
  advancedReportingRoutes,
  knowledgeBaseRoutes
];
