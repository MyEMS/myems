// let todayStr = new Date().toISOString().replace(/T.*$/, '');
// var options = { month: 'long' };
// let currentMonthName = new Intl.DateTimeFormat('en-US', options).format(todayStr);
import * as uuid from 'uuid/v4';

const today = new Date()
  .getDate()
  .toString()
  .padStart(2, '0');

let currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
const nextMonth = (currentMonth + 1).toString().padStart(2, '0');
const prevMonth = (currentMonth - 1).toString().padStart(2, '0');
const currentYear = new Date().getUTCFullYear();

const events = [
  {
    id: uuid(),
    title: 'Boot Camp',
    start: `${currentYear}-${currentMonth}-01 10:00:00`,
    end: `${currentYear}-${currentMonth}-03 16:00:00`,
    description:
      "Boston Harbor Now in partnership with the Friends of Christopher Columbus Park, the Wharf District Council and the City of Boston is proud to announce the New Year's Eve Midnight Harbor Fireworks! This beloved nearly 40-year old tradition is made possible by the generous support of local waterfront organizations and businesses and the support of the City of Boston and the Office of Mayor Marty Walsh.",
    className: 'bg-soft-success',
    location: 'Boston Harborage, Christopher Columbus Park, </br> Boston, MA 02109, United States',
    organizer: 'Boston Harbor Now'
  },
  {
    id: uuid(),
    title: `Crain's New York Business `,
    start: `${currentYear}-${currentMonth}-11`,
    description: `Crain's 2020 Hall of Fame. Sponsored Content By Crain's Content Studio. Crain's Content Studio Presents: New Jersey: Perfect for Business. Crain's Business Forum: Letitia James, New York State Attorney General. Crain's NYC Summit: Examining racial disparities during the pandemic`,
    className: 'bg-soft-primary'
  },

  {
    id: uuid(),
    title: 'Conference',
    start: `${currentYear}-${currentMonth}-${today}`,
    description:
      'The Milken Institute Global Conference gathered the best minds in the world to tackle some of its most stubborn challenges. It was a unique experience in which individuals with the power to enact change connected with experts who are reinventing health, technology, philanthropy, industry, and media.',
    className: 'bg-soft-success',
    allDay: true,
    schedules: [
      {
        id: uuid(),
        title: 'Reporting',
        start: `${currentYear}-${currentMonth}-${today} 11:00:00`,
        description: 'Time to start the conference and will briefly describe all information about the event.',
        className: 'event-bg-soft-success'
      },
      {
        id: uuid(),
        title: 'Lunch',
        start: `${currentYear}-${currentMonth}-${today} 14:00:00`,
        description: 'Lunch facility for all the attendance in the conference.',
        className: 'event-bg-soft-success'
      },
      {
        id: uuid(),
        title: 'Contest',
        start: `${currentYear}-${currentMonth}-${today} 16:00:00`,
        description: 'The starting of the programming contest',
        className: 'event-bg-soft-success'
      },
      {
        id: uuid(),
        title: 'Dinner',
        start: `${currentYear}-${currentMonth}-${today} 22:00:00`,
        description: 'Dinner facility for all the attendance in the conference',
        className: 'event-bg-soft-success'
      }
    ]
  },
  {
    id: uuid(),
    title: `ICT Expo ${currentYear} - Product Release`,
    start: `${currentYear}-${currentMonth}-16 10:00:00`,
    description: `ICT Expo ${currentYear} is the largest private-sector exposition aimed at showcasing IT and ITES products and services in Switzerland.`,
    end: `${currentYear}-${currentMonth}-18 16:00:00`,
    className: 'bg-soft-warning'
  },
  {
    id: uuid(),
    title: 'Meeting',
    start: `${currentYear}-${currentMonth}-07 10:00:00`,
    description: 'Discuss about the upcoming projects in current year and assign all tasks to the individuals'
  },
  {
    id: uuid(),
    title: 'Meeting',
    start: `${currentYear}-${currentMonth}-14 10:00:00`,
    description:
      'PeaceX is an international peace and amity organisation that aims at casting a pall at the striking issues surmounting the development of peoples and is committed to impacting the lives of young people all over the world.'
  },
  {
    id: uuid(),
    title: 'Event With Url',
    start: `${currentYear}-${currentMonth}-23`,
    description: 'Will celebrate birthday party with my friends and family',
    className: 'bg-soft-success',
    url: 'http://google.com'
  },
  {
    id: uuid(),
    title: 'Meeting',
    start: `${currentYear}-${currentMonth}-26`,
    description: 'Sample example of a event with url. Click the event, will redirect to the given link.',
    className: 'bg-soft-danger'
  },
  {
    id: uuid(),
    title: 'Birthday Party',
    start: `${currentYear}-${nextMonth}-05`,
    description:
      'The Future of Zambia – Top 30 Under 30 is an annual award, ranking scheme, and recognition platform for young Zambian achievers under the age of 30, who are building brands, creating jobs, changing the game, and transforming the country.',
    className: 'bg-soft-primary'
  },
  {
    id: uuid(),
    title: 'Click for Google',
    url: 'http://google.com/',
    start: `${currentYear}-${prevMonth}-10`,
    description:
      'Applications are open for the New Media Writing Prize 2020. The New Media Writing Prize (NMWP) showcases exciting and inventive stories and poetry that integrate a variety of formats, platforms, and digital media.',
    className: 'bg-soft-primary'
  }
];

export default events;
