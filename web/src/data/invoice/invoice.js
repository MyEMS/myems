import logoInvoice from '../../assets/img/logos/logo-invoice.png';

export default {
  institution: 'Falcon Design Studio',
  logo: logoInvoice,
  address: '156 University Ave, Toronto<br />On, Canada, M5H 2H7',
  tax: 0.08,
  currency: '$',
  user: {
    name: 'Antonio Banderas',
    address: '1954 Bloor Street West<br/>Torronto ON, M6P 3K9<br/>Canada',
    email: 'example@gmail.com',
    cell: '+4444-6666-7777'
  },
  summary: {
    invoice_no: 14,
    order_number: 'AD20294',
    invoice_date: '2018-09-25',
    payment_due: 'Upon receipt',
    amount_due: 19688.4
  },
  products: [
    {
      name: 'Platinum web hosting package',
      description: 'Down 35mb, Up 100mb',
      quantity: 2,
      rate: 65
    },
    {
      name: '2 Page website design',
      description: 'Includes basic wireframes and responsive templates',
      quantity: 1,
      rate: 2100
    },
    {
      name: 'Mobile App Development',
      description: 'Includes responsive navigation',
      quantity: 8,
      rate: 500
    },
    {
      name: 'Web App Development',
      description: 'Includes react spa',
      quantity: 6,
      rate: 2000
    }
  ]
};
