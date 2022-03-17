import paperPlane from '../../assets/img/illustrations/paper-plane.svg';
import startup from '../../assets/img/illustrations/startup.svg';

export default [
  {
    type: 'Free',
    price: {
      month: 0,
      year: 0
    },
    image: paperPlane,
    features: [
      { title: 'Unlimited Broadcasts' },
      { title: 'Unlimited Sequences' },
      { title: 'Advanced marketing' },
      { title: 'Api & Developer Tools' },
      { title: 'Integrations', isDisable: true },
      { title: 'Payments', isDisable: true },
      { title: 'Unlimited Tags', isDisable: true },
      { title: 'Custom Fields', isDisable: true }
    ],
    button: {
      text: 'Start free trial',
      color: 'outline-primary'
    }
  },
  {
    type: 'Pro',
    price: {
      month: 11,
      year: 99
    },
    image: startup,
    features: [
      { title: 'Unlimited Broadcasts' },
      { title: 'Unlimited Sequences' },
      { title: 'Advanced marketing' },
      { title: 'Api & Developer Tools' },
      { title: 'Integrations' },
      { title: 'Payments' },
      { title: 'Unlimited Tags' },
      { title: 'Custom Fields' }
    ],
    button: {
      text: 'Purchase Now',
      color: 'primary'
    }
  }
];
