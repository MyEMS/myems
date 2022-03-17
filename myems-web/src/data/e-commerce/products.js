import uuid from 'uuid/v1';

import product1 from '../../assets/img/products/1.jpg';
import product12 from '../../assets/img/products/1-2.jpg';
import product13 from '../../assets/img/products/1-3.jpg';
import product14 from '../../assets/img/products/1-4.jpg';
import product15 from '../../assets/img/products/1-5.jpg';
import product16 from '../../assets/img/products/1-6.jpg';
import product2 from '../../assets/img/products/2.jpg';
import product4 from '../../assets/img/products/4.jpg';
import product3 from '../../assets/img/products/3.jpg';
import product8 from '../../assets/img/products/8.jpg';
import product6 from '../../assets/img/products/6.jpg';
import product7 from '../../assets/img/products/7.jpg';
import product5 from '../../assets/img/products/5.jpg';
import product9 from '../../assets/img/products/9.jpg';

export default [
  {
    id: uuid(),
    files: [
      {
        id: uuid(),
        path: ' product2',
        src: product2
      }
    ],
    title: 'Apple iMac Pro (27-inch with Retina 5K Display, 3.0GHz 10-core Intel Xeon W, 1TB SSD)',
    category: 'Computer & Accessories',
    features: ['16GB RAM', '1TB SSD Hard Drive', '10-core Intel Xeon', 'Mac OS', 'Secured'],
    price: 2399,
    sale: 50,
    rating: 4,
    review: 8,
    shippingCost: 50,
    isInStock: true,
    isNew: true
  },
  {
    id: uuid(),
    files: [
      {
        id: uuid(),
        path: ' product1',
        src: product1
      },
      {
        id: uuid(),
        path: ' product12',
        src: product12
      },
      {
        id: uuid(),
        path: ' product13',
        src: product13
      },
      {
        id: uuid(),
        path: ' product14',
        src: product14
      },
      {
        id: uuid(),
        path: ' product15',
        src: product15
      },
      {
        id: uuid(),
        path: ' product16',
        src: product16
      }
    ],
    title:
      'Apple MacBook Pro (15" Retina, Touch Bar, 2.2GHz 6-Core Intel Core i7, 16GB RAM, 256GB SSD) - Space Gray (Latest Model)',
    category: 'Computer & Accessories',
    features: ['16GB RAM', '256GB SSD Hard Drive', 'Intel Core i7', 'Mac OS', 'Space Gray'],
    price: 7199,
    rating: 4.5,
    review: 20,
    shippingCost: 65,
    isInStock: false,
    isNew: true
  },
  {
    id: uuid(),
    files: [
      {
        id: uuid(),
        path: ' product4',
        src: product4
      }
    ],
    title: 'Apple iPad Air 2019 (3GB RAM, 128GB ROM, 8MP Main Camera)',
    category: 'Mobile & Tabs',
    features: ['3GB RAM', '128GB ROM', 'Apple A12 Bionic (7 nm)', 'iOS 12.1.3'],
    price: 750,
    sale: 25,
    rating: 2.5,
    review: 14,
    shippingCost: 47,
    isInStock: true
  },
  {
    id: uuid(),
    files: [
      {
        id: uuid(),
        path: ' product3',
        src: product3
      }
    ],
    title: 'Apple iPhone XS Max (4GB RAM, 512GB ROM, 12MP Main Camera)',
    category: 'Mobile & Tabs',
    features: ['4GB RAM', '512GB Internal Storage', 'Apple A12 Bionic (7nm)', 'iOS 12', '3174mAh Li-Ion Battery'],
    price: 1050,
    rating: 4.5,
    review: 13,
    shippingCost: 65,
    isInStock: true
  },
  {
    id: uuid(),
    files: [
      {
        id: uuid(),
        path: ' product8',
        src: product8
      }
    ],
    title: 'Canon Standard Zoom Lens',
    category: 'Camera',
    price: 500,
    sale: 20,
    rating: 4,
    review: 10,
    shippingCost: 60,
    isInStock: false,
    isNew: true
  },
  {
    id: uuid(),
    files: [
      {
        id: uuid(),
        path: ' product6',
        src: product6
      }
    ],
    title: 'Logitech G305 Gaming Mouse',
    category: 'Computer & Accessories',
    price: 95,
    sale: 50,
    rating: 3.5,
    review: 6,
    shippingCost: 20,
    isInStock: true,
    isNew: true
  },
  {
    id: uuid(),
    files: [
      {
        id: uuid(),
        path: ' product7',
        src: product7
      }
    ],
    title: 'Nikon D3200 Digital  DSLR Camera',
    category: 'Camera',
    price: 2398,
    rating: 4,
    review: 5,
    shippingCost: 30,
    isInStock: true
  },
  {
    id: uuid(),
    files: [
      {
        id: uuid(),
        path: ' product5',
        src: product5
      }
    ],
    title: 'Apple Watch Series 4 44mm GPS Only',
    category: 'Watches & Accessories',
    price: 400,
    sale: 10,
    rating: 5,
    review: 4,
    shippingCost: 24,
    isInStock: true,
    isNew: true
  },
  {
    id: uuid(),
    files: [
      {
        id: uuid(),
        path: ' product9',
        src: product9
      }
    ],
    title: 'Nikon AF-S FX NIKKOR 24-70mm',
    category: 'Camera',
    price: 956.57,
    rating: 5,
    review: 4,
    shippingCost: 50,
    isInStock: true
  }
];
