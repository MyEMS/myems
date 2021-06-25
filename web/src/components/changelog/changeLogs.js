export default [
  {
    title: `2.10.2 - African hobby`,
    publish: '13 May, 2021',
    logs: {
      Fix: ['Plyr plugin compatibility'],
    }
  },
  {
    title: `2.10.1 - Greater Kestrels`,
    publish: '19 November, 2020',
    logs: {
      New: ['<strong>Component</strong> : Tabs'],
      Fix: ['Chat page flickering on fluid layout'],
      Migration: {
        Add: ['<code>src/components/bootstrap-component/Tabs.js</code>'],
        Update: ['<code>src/components/chat/Chat.js</code>']
      }
    }
  },
  {
    title: `2.10.0 - Eurasian hobby`,
    publish: '14 November, 2020',
    logs: {
      New: ['<strong>Component</strong> : Autocomplete', '<strong>Plugin</strong> : <code>FuseJS</code>'],
      Migration: {
        Add: ['<code>src/components/bootstrap-component/AutocompleteExample.js</code>'],
        Update: [
          '<code>src/data/autocomplete/autocomplete.js</code>',
          '<code>src/components/navbar/NavbarTop.js</code>',
          '<code>src/components/navbar/NavbarDropdownComponents.js</code>',
          '<code>src/components/navbar/NavbarDropdown.js</code>',
          '<code>src/components/navbar/SearchBox.js</code>',
          '<code>src/assets/scss/theme/_search-box.scss</code>',
          '<code>src/assets/scss/theme/_hover.scss</code>',
          '<code>src/assets/scss/theme/_navbar.scss</code>',
          'Move All variables From <code>src/assets/scss/theme/_navbar-vertical.scss</code> To <code>src/assets/scss/theme/_variables.scss</code>'
        ]
      }
    }
  },
  {
    title: `2.9.0 - Banded kestrel`,
    publish: '02 November, 2020',
    logs: {
      New: [
        '<strong>Page</strong> :Calender',
        '<strong>DOC</strong> : Full Calendar',
        '<strong>Plugin</strong> : <code>FullCalendar</code>'
      ],
      Migration: {
        Add: [
          '<code>src/components/calendar/*.*</code>',
          '<code>src/components/plugins/CalenderExample.js</code>',
          '<code>src/assets/scss/theme/plugins/_full-calender.scss</code>'
        ]
      }
    }
  },
  {
    title: `2.8.0 - Dickinson's kestrel`,
    publish: '28 September, 2020',
    logs: {
      New: ['Navbar combo layout', '<strong>DOC</strong> : Navbar combo Doc'],
      Update: ['<strong>DOC</strong>: Documentation'],
      Migration: {
        Add: ['<code>src/components/bootstrap-components/Combo.js</code>'],
        Update: [
          '<code>src/Main.js</code>',
          '<code>src/context/Context.js</code>',
          '<code>src/layouts/DashboardLayout.js</code>',
          '<code>src/components/navbar/NavbarVertical.js</code>',
          '<code>src/components/navbar/TopNavRightSideNavItem.js</code>',
          '<code>src/components/side-panel/SidePanelModal.js</code>',
          '<code>src/components/navbar/NavbarTopDropDownMenus.js</code>',
          '<code>src/components/changelog/changeLogs.js</code>'
        ]
      }
    }
  },
  {
    title: '2.7.1 - Fox Kestrel',
    publish: '21 September, 2020',
    logs: {
      New: ['<strong>DOC</strong> : Fontawesome Doc'],
      Fix: [
        'Message page textarea hight issue',
        'Product details page review input field submit issue',
        'Customer page nameFormatter function argument destructing issue',
        'Fixes <code>Badge</code> component class name and <code>Card</code> component tag name'
      ],
      Migration: {
        Add: ['<code>src/components/bootstrap-component/Fontawesome.js</code>'],
        Update: [
          '<code>src/components/chat/content/MessageTextArea.js</code>',
          '<code>src/components/e-commerce/product-details/ProductDetailsFooter.js</code>',
          '<code>src/components/e-commerce/Customers.js</code>'
        ]
      }
    }
  },
  {
    title: '2.7.0 - Spotted Kestrels',
    publish: '2 July, 2020',
    logs: {
      New: [
        'Navbar Inverted in Navbar Vertical',
        'Navbar Vibrant in Navbar Vertical',
        'Navbar Card in Navbar Vertical',
        '<strong>DOC</strong> : Vertical Navbar'
      ],
      Migration: {
        Add: ['<code>src/components/bootstrap-component/VerticalNavbar.js</code>'],
        Update: [
          '<code>src/component/main.js</code>',
          '<code>src/component/navbar/NavbarVertical.js</code>',
          '<code>src/component/side-panel/SidePanelModal.js</code>',
          '<code>src/assets/scss/theme/_buttons.scss</code>',
          '<code>src/assets/scss/dark/_variables.scss</code>',
          '<code>src/assets/scss/theme/_variables.scss</code>',
          '<code>src/assets/scss/theme/_Navbar-vertical.scss</code>'
        ]
      }
    }
  },
  {
    title: '2.6.0 - Laughing',
    publish: '27 june, 2020',
    logs: {
      New: [
        '<strong>Page</strong>: Kanban',
        '<strong>Plugin</strong>: <code>React Beautiful DnD</code>',
        '<strong>Component</strong>: Cookie Notice Alert',
        '<strong>Doc</strong>: React Beautiful DnD',
        '<strong>Doc</strong>: Cookie Notice Alert',
        '<strong>Doc</strong>: React Bootstrap Table next'
      ],

      Fix: ['Sidebar sticky-top on profile page.'],

      Migration: {
        Add: [
          '<code>src/components/kanban/**/*.*</code>',
          '<code>src/components/bootstrap-component/cookieNotice.js</code>',
          '<code>src/components/plugins/ReactBeautifulDnD.js</code>',
          '<code>src/components/plugins/ReactBootstrapTable2.js</code>',
          '<code>src/assets/scss/_kanban.scss</code>',
          '<code>src/assets/scss/_notice.scss</code>'
        ],
        Update: [
          '<code>src/routs.js</code>',
          '<code>src/helpers/utils.js</code>',
          '<code>src/layout/DashboardRoutes.js</code>',
          '<code>src/layout/DashboardLayout.js</code>',
          '<code>src/component/side-panel/SidePanelModal.js</code>',
          '<code>src/component/navbar/navbarTop.js</code> (removed <code>sticky-top</code> class from Navbar)',
          '<code>src/assets/scss/theme/_theme.scss</code>',
          '<code>src/assets/scss/theme/_mixed.scss</code>',
          '<code>src/assets/scss/theme/_modal.scss</code>',
          '<code>src/assets/scss/dark/_override.scss</code>',
          '<code>src/assets/scss/theme/_border.scss</code>',
          '<code>src/assets/scss/theme/_dropdown.scss</code>',
          '<code>src/assets/scss/theme/_scrollbar.scss</code>',
          '<code>src/assets/scss/theme/utilities/_hover.scss</code>',
          '<code>src/assets/scss/theme/utilities/_line-height.scss</code>'
        ]
      }
    }
  },
  {
    title: '2.5.0 - Chipping',
    publish: '29 April, 2020',
    logs: {
      New: [
        '<strong>Page</strong>: <code>Widgets</code>',
        '<strong>Component Page</strong>: <code>Carousel</code>',
        '<strong>Component Page</strong>: <code>Spinner</code>',
        '<strong>Component</strong>: <code>Navber Top</code>',
        '<strong>Component</strong>: <code>Sidepanel Modal</code>',
        '<strong>Dropdown On Hover</strong>',
        '<strong>Component Doc</strong>: <code>Navbar Top</code> ',
        '<strong>Component Doc</strong>: <code>Sidepanel</code>'
      ],

      Fix: ['Gap between Photos card and Experience card in smaller device'],

      Migration: {
        Add: [
          '<code>src/assets/scss/theme/_modal.scss</code>',
          '<code>src/components/widgets/**/*.*</code>',
          '<code>src/components/side-panel/**/*.*</code>',
          '<code>src/components/email/EmailDetailHeader.js</code>',
          '<code>src/components/navbar/SettingsAnimatedIcon.js</code>',
          '<code>src/components/navbar/TopNavRightSideNavItem.js</code>',
          '<code>src/components/e-commerce/OrderDetailsHeader.js</code>',
          '<code>src/components/bootstrap-components/NavBarTop.js</code>',
          '<code>src/components/navbar/LandingRightSideNavItem.js</code>',
          '<code>src/components/bootstrap-components/Sidepanel.js</code>',
          '<code>src/components/bootstrap-components/Carousel.js</code>',
          '<code>src/components/bootstrap-components/Spinners.js</code>',
          '<code>src/components/navbar/NavbarDropdownComponents.js</code>',
          '<code>src/components/dashboard/DashboardDepositStatus.js</code>'
        ],
        Update: [
          '<code>src/assets/scss/theme/_theme.scss</code>',
          '<code>src/assets/scss/theme/_forms.scss</code>',
          '<code>src/assets/scss/theme/_scrollbar.scss</code>',
          '<code>src/assets/scss/theme/_navbar.scss</code>',
          '<code>src/assets/scss/theme/_navbar-top.scss</code>',
          '<code>src/assets/scss/theme/_navbar-vertical.scss</code>',
          '<code>src/assets/scss/theme/_button.scss</code>',
          '<code>src/assets/scss/theme/utilities/_background.scss</code> in this file updated <code>.bg-gradient</code> class',
          '<code>src/assets/scss/theme/_variables.scss</code> updated tooltip variable',
          '<code>src/assets/scss/theme/_documentation.scss</code>',

          '<code>src/Main.js</code>',
          '<code>src/routes.js</code>',
          '<code>src/config.js</code>',
          '<code>src/helpers/utils.js</code>',
          '<code>src/components/page/People.js</code>',
          '<code>src/layouts/DashboardLayout.js</code>',
          '<code>src/components/email/Compose.js</code>',
          '<code>src/components/feed/FeedCard.js</code>',
          '<code>src/components/feed/AddToFeed.js</code>',
          '<code>src/components/navbar/NavbarTop.js</code>',
          '<code>src/components/email/EmailDetail.js</code>',
          '<code>src/components/feed/FeedInterest.js</code>',
          '<code>src/components/page/InvitePeople.js</code>',
          '<code>src/components/page/Notifications.js</code>',
          '<code>src/components/feed/BirthdayNotice.js</code>',
          '<code>src/components/navbar/NavbarStandard.js</code>',
          '<code>src/components/experience/Experience.js</code>',
          '<code>src/components/profile/ProfileFooter.js</code>',
          '<code>src/components/dashboard-alt/Weather.js</code>',
          '<code>src/components/navbar/NavbarDropdown.js</code>',
          '<code>src/components/navbar/ProfileDropdown.js</code>',
          '<code>src/components/dashboard-alt/TopProducts.js</code>',
          '<code>src/components/dashboard-alt/DashboardAlt.js</code>',
          '<code>src/components/dashboard-alt/SpaceWarning.js</code>',
          '<code>src/components/navbar/NotificationDropdown.js</code>',
          '<code>src/components/profile/ProfileContent.js</code> from this file, <code>ActivityLog</code> Component has been updated'
        ]
      }
    }
  },
  {
    title: '2.4.0 - Nankeen Kestrel',
    publish: '2 April, 2020',
    logs: {
      New: [
        '<strong>Page</strong>: Chat',
        '<strong>Plugin</strong>: <code>Emoji Mart</code>',
        '<strong>Doc</strong>: Emoji Mart'
      ],
      Fix: ['Dashboard recent purchases Table caret icon sorting direction issue.'],

      Migration: {
        Add: [
          '<code>src/components/chat/**/*.*</code>',
          '<code>src/assets/scss/theme/_chat.scss</code>',
          '<code>src/assets/scss/theme/plugins/_emoji.scss</code>'
        ],
        Update: [
          '<code>src/assets/scss/theme/_theme.scss</code>',
          '<code>src/assets/scss/theme/_plugins.scss</code>',
          '<code>src/assets/scss/theme/plugins/_react-bootstrap-table2-sort.scss</code>'
        ]
      }
    }
  },
  {
    title: '2.3.1 - Common Kestrel',
    publish: '10 March, 2020',
    logs: {
      Fix: ['Main Navigation collapse issue when navigating between pages from mobile devices'],
      Migration: {
        Replace: [
          '<code>src/components/navbar/NavbarVerticalMenu.js</code>',
          '<code>src/components/common/CodeHighlight.js</code>',
          '<code>src/components/changelog/**/*.*</code>'
        ]
      }
    }
  },
  {
    title: '2.3.0 - Lesser Kestrel',
    publish: '27 February, 2020',
    logs: {
      New: ['<strong>Feature</strong>: Navbar vertical collapsed'],
      Update: ['<strong>Doc</strong>: Lottie', '<strong>Doc</strong>: Dropzone'],
      Migration: {
        Replace: [
          '<code>package.json</code>',
          '<code>public/index.html</code>',
          '<code>public/css/**/*.*</code>',
          '<code>src/assets/scss/**/*.*</code>',
          '<code>src/Main.js</code>',
          '<code>src/helpers/toggleStylesheet.js</code>',
          '<code>src/components/dashboard/LeafletMap.js</code>',
          '<code>src/components/navbar/NavbarTop.js</code>',
          '<code>src/components/navbar/NavbarVertical.js</code>',
          '<code>src/components/navbar/NavbarVerticalMenu.js</code>',
          '<code>src/components/navbar/NavbarVerticalMenuItem.js</code>',
          '<code>src/components/changelog/**/*.*</code>'
        ],
        Add: [
          '<code>src/components/navbar/ToggleButton.js</code>',
          '<code>src/components/common/CodeHighlight.js</code>'
        ]
      }
    }
  },
  {
    title: '2.2.0 - Laggar',
    publish: '10 February, 2020',
    logs: {
      New: [
        '<strong>Plugin</strong>: <code>React leaflet map</code>',
        '<strong>Plugin</strong>: <code>leaflet-markercluster</code>',
        '<strong>Plugin</strong>: <code>leaflet.tilelayer.colorfilter</code>',
        '<strong>Plugin</strong>: <code>react-scrollbars-custom</code>',
        '<strong>Component</strong>: Custom Scrollbar',
        '<strong>Doc</strong>: React Hook Form',
        '<strong>Doc</strong>: Custom Scroll Bar',
        '<strong>Doc</strong>: Leaflet Map',
        '<strong>Doc</strong>: Echart Map'
      ],
      Update: [
        '<strong>Component</strong>: Disable Button',
        '<strong>Component</strong>: Purchases Table',
        '<strong>Component</strong>: Leaflet Map (Dashboard alt)',
        '<strong>Page</strong>: products List',
        '<strong>Doc</strong>: Echart'
      ]
    }
  },
  {
    title: '2.1.0 - Saker',
    publish: '20 January, 2020',
    logs: {
      New: [
        '<strong>Page</strong>: Authentication step wizard',
        '<strong>Plugin</strong>: <code>react-hook-form</code>'
      ]
    }
  },
  {
    title: '2.0.0 - Lanner',
    publish: '01 January, 2020',
    logs: {
      New: [
        '<strong>Component</strong>: Running Projects (Dashboard alt)',
        '<strong>Component</strong>: Total Sales (Dashboard alt)',
        '<strong>Mode</strong>: Dark',
        '<strong>Doc</strong>: Plyr',
        '<strong>Doc</strong>: Slick Carousel'
      ],
      Update: ['<strong>Doc</strong>: Echart']
    }
  },
  {
    title: '1.3.0 - Aplomado',
    publish: '18 December, 2019',
    logs: {
      New: ['<strong>Page</strong>: Feed', '<strong>Plugin</strong>: Plyr']
    }
  },
  {
    title: '1.2.0 - Kestrels',
    publish: '11 December, 2019',
    logs: {
      New: [
        '<strong>Page</strong>: Product List',
        '<strong>Page</strong>: Product Grid',
        '<strong>Page</strong>: Product Details',
        '<strong>Page</strong>: Orders',
        '<strong>Page</strong>: Order Details',
        '<strong>Page</strong>: Customers',
        '<strong>Page</strong>: Shopping Cart',
        '<strong>Page</strong>: Checkout',
        '<strong>Page</strong>: Favorite Items',
        'Counter on cart icon'
      ],
      Update: [
        '<strong>CSS</strong>: Bootstrap to <code>v4.4.1</code>',
        '<strong>Js</strong>: <code>utils.js</code>',
        'Top nav badge icons'
      ]
    }
  },
  {
    title: '1.1.0 - Gyrfalcon',
    publish: '04 November, 2019',
    logs: {
      New: [
        '<strong>Page</strong>: Dashboard Alt',
        '<strong>Page</strong>: Inbox',
        '<strong>Page</strong>: Email detail',
        '<strong>Page</strong>: Compose',
        '<strong>Plugin</strong>: Bulk select',
        '<strong>Plugin</strong>: WYSIWYG Editor',
        '<strong>Plugin</strong>: Progressbar'
      ],
      Fix: ['Redirect to 404'],
      Update: [
        'Add autoprefixer configuration in <code>package.json</code>',
        'Update autoprefixer configuration in <code>gulpfile.js</code>',
        '<strong>Js</strong>: <code>utils.js</code>'
      ]
    }
  },
  {
    title: '1.0.0 - initial release',
    publish: '30 September, 2019',
    children: 'Nothing to see here.'
  }
];
