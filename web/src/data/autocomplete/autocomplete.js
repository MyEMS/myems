import imageFile1 from '../../assets/img/products/3-thumb.png';
import imageFile2 from '../../assets/img/icons/zip.png';
import imageMember1 from '../../assets/img/team/1.jpg';
import imageMember2 from '../../assets/img/team/2.jpg';
import imageMember3 from '../../assets/img/team/3.jpg';

const autoCompleteInitialItem = [
  { url: `/pages/events`, breadCrumbTexts: ['Pages ', ' Events'], catagories: 'recentlyBrowsedItems' },
  {
    url: `/e-commerce/customers`,
    breadCrumbTexts: ['E-commerce ', ' Customers'],
    catagories: 'recentlyBrowsedItems'
  },
  {
    catagories: 'suggestedFilters',
    url: `/e-commerce/customers`,
    key: 'customers',
    text: 'All customers list',
    type: 'warning'
  },
  {
    catagories: 'suggestedFilters',
    url: `/pages/events`,
    key: 'events',
    text: 'Latest events in current month',
    type: 'success'
  },
  {
    catagories: 'suggestedFilters',
    url: `/e-commerce/products/grid`,
    key: 'products',
    text: 'Most popular products',
    type: 'info'
  },
  {
    catagories: 'suggestionFiles',
    url: '#!',
    img: imageFile1,
    file: true,
    title: 'iPhone',
    imgAttrs: { class: 'border h-100 w-100 fit-cover rounded-lg' },
    time:
      '<span class="font-weight-semi-bold">Antony</span><span class="font-weight-medium text-600 ml-2">27 Sep at 10:30 AM</span>'
  },
  {
    catagories: 'suggestionFiles',
    url: '#!',
    img: imageFile2,
    file: true,
    title: 'Falcon v1.8.2',
    imgAttrs: { class: 'img-fluid' },
    time:
      '<span class="font-weight-semi-bold">John</span><span class="font-weight-medium text-600 ml-2">30 Sep at 12:30 PM</span>'
  },
  {
    url: `/pages/profile`,
    catagories: 'suggestionMembers',
    icon: { img: imageMember1, size: 'l', status: 'status-online' },
    title: 'Anna Karinina',
    text: 'Technext Limited'
  },
  {
    url: `/pages/profile`,
    catagories: 'suggestionMembers',
    icon: { img: imageMember2, size: 'l' },
    title: 'Antony Hopkins',
    text: 'Brain Trust'
  },
  {
    url: `/pages/profile`,
    catagories: 'suggestionMembers',
    icon: { img: imageMember3, size: 'l' },
    title: 'Emma Watson',
    text: 'Google'
  }
];

export default autoCompleteInitialItem;
