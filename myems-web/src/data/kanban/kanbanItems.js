import image1 from '../../assets/img/kanban/1.jpg';
import image2 from '../../assets/img/kanban/2.jpg';
import image3 from '../../assets/img/kanban/3.jpg';
import image4 from '../../assets/img/kanban/4.jpg';
import beach from '../../assets/video/beach/beach.jpg';
import beachVideo from '../../assets/video/beach/beach.mp4';

export const rawItems = [
  { id: 1, title: '👌 <strong>Drag cards</strong> to any list and place anywhere in the list' },
  { id: 2, title: '👇 <strong>Click</strong> cards to see the detail of the cards or edit them' },
  { id: 3, title: '➕ <strong>Click "Add Another Card" </strong> at the bottom of the list for a new card' },
  {
    id: 4,
    title: '<strong>Hovering on the cards</strong> will reveal meatball (...) button, click that for more options'
  },
  { id: 5, title: '<strong>At the top of the board, click ⭐</strong> to pin this board to your favorites ' },
  {
    id: 6,
    title: '🙋 Add members to the board by clicking <strong>+ Invite</strong> at the top of the board'
  },
  { id: 7, title: '📃 Add more lists to this board by clicking <strong>+ Add Another List</strong>' },
  { id: 8, title: '<strong>Click the meatball (...)</strong> button at the top of any list for more options' },
  {
    id: 9,
    title: 'Add a cookie notice, which will be shown at the bottom of the page and has a link of "Privacy Policy"',
    user: 'Kit',
    checklist: { totalCount: 6, completed: 3 },
    members: [1]
  },
  {
    id: 10,
    title: 'Add a pdf file that describes all the symptoms of COVID-19',
    user: 'Rowan',
    modalID: '#kanban-modal-3',
    members: [3, 4],
    attachments: [{ type: 'image', url: image2, className: 'py-8' }]
  },
  {
    id: 11,
    title: 'Make a Registration form that includes Name, Email, and a Password input field',
    user: 'Antony',
    labels: [{ color: 'success', text: 'New' }, { color: 'primary', text: 'Goal' }],
    attachments: [{ type: 'doc', name: 'test.txt' }],
    checklist: { totalCount: 10, completed: 2 },
    members: [3]
  },
  {
    id: 12,
    title: 'Update profile page layout with cover image and user setting menu',
    user: 'Emma',
    labels: [{ color: 'info', text: 'Enhancement' }],
    attachments: [{ type: 'txt', url: `falcon.txt` }],
    members: [1, 2, 3]
  },
  {
    id: 13,
    title: 'Update all the npm packages and also remove the outdated plugins',
    user: 'Emma',
    labels: [{ color: 'danger', text: 'bug' }],
    checklist: { totalCount: 5, completed: 5 },
    members: [4, 1, 2]
  },
  {
    id: 14,
    title: 'Add a getting started page that allows users to see the starting process',
    user: 'Anna',
    labels: [{ color: 'secondary', text: 'Documentation' }],
    attachments: [{ type: 'pdf', url: `sample.pdf` }, { type: 'txt', url: `example.txt` }],
    members: [2]
  },
  { id: 21, title: 'Review and test all the task and deploy to the server' },
  {
    id: 15,
    title: 'Get all the data by API call and show them to the landing page by adding a new section',
    labels: [{ color: 'success', text: 'New' }]
  },
  {
    id: 16,
    title: 'Add a new illustration to the landing page according to the contrast of the current theme ',
    user: 'John',
    modalID: '#kanban-modal-2',
    attachments: [{ type: 'image', url: image1, className: 'py-9' }, { type: 'doc', name: 'test.txt' }],
    members: [5, 6, 3]
  },
  {
    id: 17,
    title: 'Design a new E-commerce, Product list, and details page',
    labels: [{ color: 'info', text: 'Goal' }]
  },
  {
    id: 18,
    title: 'Make a weather app design which must have: Local weather, Weather map and weather widgets'
  },
  {
    id: 19,
    title: 'List all the Frequently Asked Questions and make an FAQ section in the landing page',
    labels: [{ color: 'secondary', text: 'Documentation' }]
  },
  { id: 20, title: 'Remove all the warning from dev dependencies and update the packages if needed' }
];

export default [
  {
    id: '1',
    name: 'Documentation',
    items: [1, 2, 3, 4, 5, 6, 7]
  },
  {
    id: '2',
    name: 'Doing',
    items: [8, 9, 10, 11, 12]
  },
  {
    id: '3',
    name: 'Review',
    items: [13, 14, 15, 16]
  },
  {
    id: '4',
    name: 'Release',
    items: [17, 18, 19, 20, 21]
  }
];

export const labels = [
  { text: 'New', type: 'success' },
  { text: 'Goal', type: 'primary' },
  { text: 'Enhancement', type: 'info' },
  { text: 'Bug', type: 'danger' },
  { text: 'Documentation', type: 'secondary' },
  { text: 'Helper', type: 'warning' }
];

export const attachments = [
  {
    image: image3,
    src: image3,
    title: 'final-img.jpg',
    date: '2020-04-18 5:25 pm',
    type: 'image'
  },
  {
    image: image4,
    src: image4,
    title: 'picture.png',
    date: '2020-04-20 4:34 pm',
    type: 'image'
  },
  { src: `#!`, title: 'sample.txt', date: '2020-04-21 2:10 pm', type: 'txt' },
  { src: `#!`, title: 'example.pdf', date: '2020-05-02 11:34 am', type: 'pdf' },
  {
    image: beach,
    src: beachVideo,
    title: 'beach.mp4',
    date: '2020-05-10 3:40 pm',
    type: 'video'
  }
];
