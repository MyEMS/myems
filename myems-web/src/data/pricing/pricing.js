export default [
  {
    type: 'Single',
    description: 'For teams that need to create project plans with confidence.',
    price: {
      month: 0,
      year: 0
    },
    button: {
      text: 'Start free trial',
      color: 'outline-primary'
    },
    featureTitle: 'Track team projects with free:',
    features: [
      { title: 'Timeline' },
      { title: 'Advanced Search' },
      {
        title: 'Custom fields',
        badge: {
          text: 'New',
          color: 'soft-success'
        }
      },
      { title: 'Task dependencies' },
      { title: 'Private teams & projects' }
    ],
    bottomButtonText: 'More about Single'
  },
  {
    type: 'Business',
    description: 'For teams and companies that need to manage work across initiatives.',
    price: {
      month: 4.3,
      year: 39
    },
    button: {
      text: 'Get Business',
      color: 'primary'
    },
    featureTitle: 'Everything in Single, plus:',
    features: [
      { title: 'Portfolios' },
      { title: ' Lock custom fields' },
      { title: ' Onboarding plan' },
      { title: 'Resource Managemen' },
      { title: 'Lock custom fields' }
    ],
    bottomButtonText: 'More about Business',
    backgroundColor: 'rgba(115, 255, 236, 0.18)'
  },
  {
    type: 'Extended',
    description: 'For organizations that need additional security and support.',
    price: {
      month: 11,
      year: 99
    },
    button: {
      text: 'Purchase',
      color: 'outline-primary'
    },
    featureTitle: 'Everything in Business, plus:',
    features: [
      { title: 'Portfolios' },
      {
        title: ' Portfolios',
        badge: {
          text: 'Coming Soon',
          color: 'soft-primary'
        }
      },
      { title: 'Onboarding plan' },
      { title: 'Resource Managemen' }
    ],
    bottomButtonText: 'More about Extended'
  }
];
