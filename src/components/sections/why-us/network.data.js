import route1 from '@/assets/images/why-us/route-1.svg?raw';
import route2 from '@/assets/images/why-us/route-2.svg?raw';
import route3 from '@/assets/images/why-us/route-3.svg?raw';
import route4 from '@/assets/images/why-us/route-4.svg?raw';
import route5 from '@/assets/images/why-us/route-5.svg?raw';
import route6 from '@/assets/images/why-us/route-6.svg?raw';
import route7 from '@/assets/images/why-us/route-7.svg?raw';
import route8 from '@/assets/images/why-us/route-8.svg?raw';
import node1 from '@/assets/images/why-us/node-1.webp';
import node2 from '@/assets/images/why-us/node-2.webp';
import node3 from '@/assets/images/why-us/node-3.webp';
import node4 from '@/assets/images/why-us/node-4.webp';
import node5 from '@/assets/images/why-us/node-5.webp';
import node6 from '@/assets/images/why-us/node-6.webp';
import node7 from '@/assets/images/why-us/node-7.webp';
import node8 from '@/assets/images/why-us/node-8.webp';

function routeArtwork(markup) {
  return {
    viewBox: markup.match(/viewBox="([^"]+)"/)[1],
    path: markup.match(/ d="([^"]+)"/)[1],
  };
}

export const routes = [
  {
    ...routeArtwork(route1),
    x: 101.59,
    y: 111.18,
    w: 46.828,
    h: 97.647,
    iw: 15.134,
    ih: 99.99,
    transform: 'rotate(160.05deg) scaleY(-1)',
  },
  {
    ...routeArtwork(route2),
    x: 101.76,
    y: 176.06,
    w: 27.647,
    h: 36.109,
    iw: 25.93,
    ih: 35.245,
    transform: 'rotate(-5.03deg)',
  },
  {
    ...routeArtwork(route3),
    x: 39.41,
    y: 88.21,
    w: 24.706,
    h: 51.812,
    iw: 21.554,
    ih: 51.394,
    transform: 'rotate(-5.03deg)',
  },
  {
    ...routeArtwork(route4),
    x: 21.76,
    y: 170,
    w: 94.706,
    h: 60,
    iw: 95.883,
    ih: 61.177,
    transform: 'none',
  },
  {
    ...routeArtwork(route5),
    x: 143.53,
    y: 57.06,
    w: 25.294,
    h: 151.765,
    iw: 26.471,
    ih: 152.941,
    transform: 'rotate(180deg) scaleY(-1)',
  },
  {
    ...routeArtwork(route6),
    x: 160,
    y: 99.41,
    w: 99.412,
    h: 115.294,
    iw: 100.588,
    ih: 116.471,
    transform: 'none',
  },
  {
    ...routeArtwork(route7),
    x: 150,
    y: 141.76,
    w: 42.353,
    h: 70.588,
    iw: 43.53,
    ih: 71.765,
    transform: 'none',
  },
  {
    ...routeArtwork(route8),
    x: 162.35,
    y: 188.35,
    w: 71.765,
    h: 60.938,
    iw: 44.149,
    ih: 62.033,
    transform: 'rotate(-70.35deg) scaleY(-1)',
  },
];

export const dots = [
  [167.06, 55.29],
  [112.94, 109.41],
  [100, 176.47],
  [62.35, 136.47],
  [20, 168.24],
  [37.65, 88.24],
  [257.65, 98.82],
  [231.76, 207.06],
  [190.59, 140],
];

export const nodeShadow = '0 7.06px 11.76px rgba(11, 36, 71, 0.14)';

export const nodes = [
  {
    icon: node1,
    x: 16.47,
    y: 41.18,
    bg: '#fbdbc2',
    border: '#ff9c2f',
    inset:
      'inset 0 -3.53px 0 rgba(200,111,53,.28), inset 0 2.35px 0 rgba(255,255,255,.55), inset 0 0 0 1.18px rgba(255,243,232,.8)',
  },
  {
    icon: node2,
    x: 92.94,
    y: 61.18,
    bg: '#0b2a57',
    border: '#17498e',
    inset:
      'inset 0 -3.53px 0 rgba(6,26,54,.35), inset 0 2.35px 0 rgba(92,132,186,.45), inset 0 0 0 1.18px rgba(60,102,160,.7)',
  },
  {
    icon: node3,
    x: 155.29,
    y: 8.24,
    bg: '#176bc9',
    border: '#176bc9',
    inset:
      'inset 0 -3.53px 0 rgba(10,74,168,.32), inset 0 2.35px 0 rgba(169,210,255,.55), inset 0 0 0 1.18px rgba(125,181,255,.75)',
  },
  {
    icon: node4,
    x: 241.18,
    y: 51.76,
    bg: '#ff7a14',
    border: '#ff4000',
    inset:
      'inset 0 -3.53px 0 rgba(185,74,0,.3), inset 0 2.35px 0 rgba(255,210,175,.48), inset 0 0 0 1.18px rgba(255,178,120,.72)',
  },
  {
    icon: node5,
    x: -4.71,
    y: 121.18,
    bg: '#dceeff',
    border: '#b9ddff',
    inset:
      'inset 0 -3.53px 0 rgba(170,197,225,.24), inset 0 2.35px 0 rgba(255,255,255,.55), inset 0 0 0 1.18px rgba(244,250,255,.85)',
  },
  {
    icon: node6,
    x: 62.35,
    y: 135.29,
    bg: '#f3b4d4',
    border: '#ed65af',
    inset:
      'inset 0 -3.53px 0 rgba(199,91,146,.28), inset 0 2.35px 0 rgba(255,241,248,.5), inset 0 0 0 1.18px rgba(255,216,234,.75)',
  },
  {
    icon: node7,
    x: 179,
    y: 94.18,
    bg: '#f3b784',
    border: '#ff8115',
    wide: true,
    inset:
      'inset 0 -3.53px 0 rgba(200,111,53,.26), inset 0 2.35px 0 rgba(255,241,230,.5), inset 0 0 0 1.18px rgba(255,220,192,.78)',
  },
  {
    icon: node8,
    x: 230.59,
    y: 165.88,
    bg: '#0b2a57',
    border: '#0b1728',
    inset:
      'inset 0 -3.53px 0 rgba(6,26,54,.34), inset 0 2.35px 0 rgba(80,117,170,.42), inset 0 0 0 1.18px rgba(54,90,140,.68)',
  },
];
