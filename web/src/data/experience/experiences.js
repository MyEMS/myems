import logoG from '../../assets/img/logos/g.png';
import logoApple from '../../assets/img/logos/apple.png';
import logoNike from '../../assets/img/logos/nike.png';
import { getDuration } from '../../helpers/utils';
import moment from 'moment';

export default [
  {
    imgSrc: logoG,
    headline: 'Big Data Engineer',
    company: 'Google',
    startDate: moment().set({ year: 2013, month: 1 }),
    endDate: '',
    get duration() {
      return getDuration(this.startDate, this.endDate);
    },
    location: 'California, USA',
    verified: true,
    to: '#!'
  },
  {
    imgSrc: logoApple,
    headline: 'Software Engineer',
    company: 'Apple',
    startDate: moment().set({ year: 2012, month: 4 }),
    endDate: moment().set({ year: 2012, month: 12 }),
    get duration() {
      return getDuration(this.startDate, this.endDate);
    },
    location: 'California, USA',
    verified: true,
    to: '#!'
  },
  {
    imgSrc: logoNike,
    headline: 'Mobile App Developer',
    company: 'Nike',
    startDate: moment().set({ year: 2011, month: 1 }),
    endDate: moment().set({ year: 2012, month: 4 }),
    get duration() {
      return getDuration(this.startDate, this.endDate);
    },
    location: 'Beaverton, USA',
    verified: true,
    to: '#!',
    divider: false
  }
];
