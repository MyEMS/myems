import github from '../../assets/img/logos/github.png';
import team17 from '../../assets/img/team/17.jpg';
import coursera from '../../assets/img/logos/coursera.png';
import spectrum from '../../assets/img/logos/spectrum.jpg';
import pinterest from '../../assets/img/logos/pinterest.png';
import medium from '../../assets/img/logos/medium.png';
import unsplash from '../../assets/img/logos/unsplash.png';
import stripe from '../../assets/img/logos/stripe.png';
import team4 from '../../assets/img/team/4.jpg';
import youtube from '../../assets/img/logos/youtube.png';
import team5 from '../../assets/img/team/5.jpg';
import goodreads from '../../assets/img/logos/goodreads.png';
import generic1 from '../../assets/img/generic/1.jpg';
import generic8 from '../../assets/img/generic/8.jpg';

export default [
  {
    id: 1,
    user: 'GitHub',
    img: github,
    title: '[GitHub] Subscribed to technext/photogallery notifications',
    description: 'Hey there, we’re just writing to let you know that you’ve been...',
    time: '11:50AM',
    star: true,
    snooze: true,
    read: true
  },
  {
    id: 2,
    user: 'Diana',
    img: team17,
    badge: 'NEW',
    title: 'Your Daily Work Summary',
    description: "And they'd probably do a lot of damage to an...",
    time: 'Mar 26',
    star: true,
    snooze: false,
    read: false
  },
  {
    id: 3,
    user: 'Coursera',
    img: coursera,
    title: 'Recommended: Server-side Development with NodeJS, Express and MongoDB',
    description: 'We combed our catalog and found courses...',
    time: 'Mar 3',
    star: true,
    snooze: false,
    read: true,
    attachments: [
      {
        id: 1,
        type: 'zip',
        icon: 'file-archive',
        fileName: 'syllabus'
      }
    ]
  },
  {
    id: 4,
    user: 'Spectrum',
    img: spectrum,
    title: 'Spectrum Weekly Digest: ZEIT watercooler, Escape Room!',
    description: 'You didn’t gain any reputation last week. Reputation is an...',
    time: 'Feb 21',
    star: false,
    snooze: false,
    read: true
  },
  {
    id: 5,
    user: 'Pinterest',
    img: pinterest,
    title: 'Tony, 14 ideas in Pink saree',
    description: 'New ideas for you in Web Development...',
    time: 'Jan 16',
    star: false,
    snooze: false,
    read: true
  },
  {
    id: 6,
    user: 'Medium',
    img: medium,
    title: 'Technology Brief: Who’s keeping us safe?',
    description: 'policy at Google, Twitter, and Pinterest, says, "The team starts to feel like the...',
    time: 'Jan 11',
    star: true,
    snooze: false,
    read: true
  },
  {
    id: 7,
    user: 'Unsplash Team',
    img: unsplash,
    title: "Get involved for International Women's Day - with link 👩",
    description: 'The link below is now clickable for Chrome users...',
    time: 'Dec 16',
    star: false,
    snooze: false,
    read: false,
    attachments: [
      {
        id: 1,
        type: 'img',
        icon: 'image',
        fileName: 'Winter',
        src: generic1
      },
      {
        id: 2,
        type: 'img',
        icon: 'image',
        fileName: 'Coffee',
        src: generic8
      }
    ]
  },
  {
    id: 8,
    user: 'Stripe',
    img: stripe,
    title: 'Confirm your Stripe email address!',
    description: 'Before you can start accepting live payments, you need to confirm your email address...',
    time: 'Dec 11',
    star: true,
    snooze: false,
    archive: true,
    read: true
  },
  {
    id: 9,
    user: 'Tony Stark',
    img: team4,
    title: 'Bruce Banner - Invitation to edit',
    description: 'Tony Stark has invited you to edit the following document...',
    time: 'Mar 9',
    star: false,
    snooze: false,
    read: true,
    attachments: [
      {
        id: 1,
        type: 'doc',
        icon: 'file-alt',
        fileName: 'Endgame schedule'
      },
      {
        id: 2,
        type: 'pdf',
        icon: 'file-pdf',
        fileName: 'Endgame schedule'
      }
    ]
  },
  {
    id: 10,
    user: 'Youtube',
    img: youtube,
    title: 'Firebase just uploaded a video',
    description: 'Firebase has uploaded Understanding Cloud Functions: Configuration settings In the last...',
    time: 'Nov 19',
    star: false,
    snooze: false,
    read: true,
    attachments: [
      {
        id: 1,
        type: 'youtube',
        icon: ['fab', 'youtube'],
        fileName: 'Cloud Functions'
      }
    ]
  },
  {
    id: 11,
    user: 'Bruce Banner',
    img: team5,
    title: 'Invitation for migration',
    description: 'Bruce Wayne, you have an invitation of migration...',
    time: 'Oct 26',
    star: false,
    snooze: false,
    read: true,
    attachments: [
      {
        id: 1,
        type: 'pdf',
        icon: 'file-pdf',
        fileName: 'Invitation'
      }
    ]
  },
  {
    id: 12,
    user: 'Goodreads',
    img: goodreads,
    title: 'Goodreads Newsletter: March 5, 2019',
    description: 'The most anticipated books of spring, a rocking read, and more! Goodreads Spring...',
    time: 'March 5',
    star: false,
    snooze: false,
    archive: true,
    read: false
  }
];
