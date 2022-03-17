import uuid from 'uuid/v1';

export default [
  {
    id: uuid(),
    calendar: { month: 'Mar', day: '26' },
    title: "Crain's New York Business",
    organizer: 'Organized by AID MIT',
    additional: 'Time: 11:00AM<br/>Duration: Feb 29 - Mar 2',
    location: 'The Liberty Warehouse, New Yourk',
    to: '/pages/event-detail'
  },
  {
    id: uuid(),
    calendar: { month: 'Feb', day: '29' },
    title: 'Film Festival',
    organizer: 'American Nuclear Society',
    additional: 'Time: 11:00AM<br/>Duration: Feb 29 - Mar 2',
    location: 'Place: Workbar - Central Square, Cambridge',
    to: '/pages/event-detail'
  },
  {
    id: uuid(),
    calendar: { month: 'Feb', day: '21' },
    title: 'Newmarket Nights',
    organizer: 'University of Oxford',
    additional: 'Time: 6:00AM<br/>Duration: 6:00AM - 5:00PM',
    location: 'Place: Cambridge Boat Club, Cambridge',
    to: '/pages/event-detail',
    badge: {
      text: 'Free',
      color: 'soft-success',
      pill: true
    }
  },
  {
    id: uuid(),
    calendar: { month: 'Dec', day: '31' },
    title: '31st Night Celebration',
    organizer: 'Chamber Music Society',
    additional: 'Time: 11:00PM<br/>280 people interested',
    location: 'Place: Tavern on the Greend, New York',
    to: '/pages/event-detail'
  },
  {
    id: uuid(),
    calendar: { month: 'Dec', day: '16' },
    title: 'Folk Festival',
    organizer: 'Harvard University',
    additional: 'Time: 9:00AM<br/>Location: Cambridge Masonic Hall Association',
    location: 'Place: Porter Square, North Cambridge',
    to: '/pages/event-detail'
  }
];
