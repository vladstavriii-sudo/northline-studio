import video1 from '@/assets/images/services/video-1.gif';
import video2 from '@/assets/images/services/video-2.gif';
import video3 from '@/assets/images/services/video-3.gif';

import web1 from '@/assets/images/services/web-1.gif';
import web2 from '@/assets/images/services/web-2.gif';
import web3 from '@/assets/images/services/web-3.gif';

import typography1 from '@/assets/images/services/typography-1.gif';
import typography2 from '@/assets/images/services/typography-2.gif';
import typography3 from '@/assets/images/services/typography-3.gif';

import visual1 from '@/assets/images/services/visual-1.gif';
import visual2 from '@/assets/images/services/visual-2.gif';

export const SERVICES = [
  {
    id: 'video',
    title: ['AI-POWERED', 'VIDEO'],
    background: 'var(--blue-700)',
    color: 'var(--blue-100)',
    images: [
      { src: video1, x: 4, y: 51, size: 21.5, rotate: -10 },
      { src: video2, x: 75, y: 91, size: 20.5, rotate: 13.26 },
      { src: video3, x: 95, y: 4, size: 27, rotate: -15.67 },
    ],
  },

  {
    id: 'web',
    title: ['WEB', 'INTERFACES'],
    background: 'var(--orange-500)',
    color: 'var(--orange-200)',
    images: [
      { src: web1, x: 23, y: 17, size: 20.75, rotate: 6.3 },
      { src: web2, x: 74.7, y: 25.9, size: 15.4, rotate: -20.13 },
      { src: web3, x: 51.5, y: 101, size: 19.2, rotate: -6 },
    ],
  },

  {
    id: 'typography',
    title: ['TYPOGRAPHY', 'SYSTEMS'],
    background: 'var(--pink-500)',
    color: 'var(--pink-400)',
    images: [
      { src: typography1, x: 14.3, y: 31.2, size: 15.5, rotate: -7.16 },
      { src: typography2, x: 90.3, y: 43.6, size: 12.4, rotate: 13.86 },
      { src: typography3, x: 57.6, y: 96.6, size: 21.5, ratio: 310 / 135 },
    ],
  },

  {
    id: 'visual',
    title: ['VISUAL', 'IDENTITIES'],
    background: 'var(--lime-500)',
    color: 'var(--lime-100)',
    images: [
      { src: visual1, x: 13.9, y: 51.1, size: 15.6 },
      { src: visual2, x: 79.1, y: 19.6, size: 15, rotate: 6.25 },
    ],
  },
];
