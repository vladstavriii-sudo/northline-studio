import skill1 from '@/assets/images/why-us/skill-1.webp';
import skill2 from '@/assets/images/why-us/skill-2.webp';
import skill3 from '@/assets/images/why-us/skill-3.webp';
import skill4 from '@/assets/images/why-us/skill-4.webp';
import skill5 from '@/assets/images/why-us/skill-5.webp';
import skill6 from '@/assets/images/why-us/skill-6.webp';
import skill7 from '@/assets/images/why-us/skill-7.webp';
import skill8 from '@/assets/images/why-us/skill-8.webp';
import skill9 from '@/assets/images/why-us/skill-9.webp';
import skill10 from '@/assets/images/why-us/skill-10.webp';
import skill11 from '@/assets/images/why-us/skill-11.webp';
import skill12 from '@/assets/images/why-us/skill-12.webp';

export const SKILLS_OFF_AT_REST = ['seo', 'github', 'weavy', 'webflow'];

export const SKILL_OFF_INSET =
  'inset 0 -3px 0 rgba(191, 191, 191, 0.28), inset 0 2px 0 rgba(235, 235, 235, 0.5), inset 0 0 0 1px rgba(230, 230, 230, 0.75)';

const light = {
  bg: '#ffffff',
  border: '#aaaaaa',
  color: '#000000',
  inset: SKILL_OFF_INSET,
};

const googleAds = { name: 'Google Ads', icon: skill12, ...light };

export const skillRows = [
  [
    { id: 'seo', name: 'SEO', icon: skill1, width: [112, 82], ...light },
    { id: 'google-ads', ...googleAds },
  ],
  [
    {
      id: 'after-effects',
      name: 'After Effects',
      icon: skill2,
      width: [null, 130],
      bg: '#2c2b7f',
      border: '#bea9fc',
      color: '#ffffff',
      inset:
        'inset 0 -3px 0 rgba(43, 42, 123, 0.26), inset 0 2px 0 rgba(151, 148, 243, 0.46), inset 0 0 0 1px rgba(65, 65, 174, 0.6)',
    },
    {
      id: 'github',
      name: 'GitHub',
      icon: skill3,
      width: [120, null],
      ...light,
    },
  ],
  [
    { id: 'google-ads-alt', width: [null, 123], ...googleAds },
    { id: 'figma', name: 'Figma', icon: skill4, width: [109, null], ...light },
  ],
  [
    {
      id: 'weavy',
      name: 'Weavy',
      icon: skill5,
      width: [100, 87],
      bg: '#d7ff3f',
      border: '#000000',
      color: '#0d0d03',
      inset:
        'inset 0 -3px 0 rgba(132, 166, 0, 0.28), inset 0 2px 0 rgba(251, 255, 209, 0.45), inset 0 0 0 1px rgba(241, 255, 174, 0.72)',
    },
    {
      id: 'content-marketing',
      name: 'Content marketing',
      icon: skill6,
      bg: '#0b2a57',
      border: '#0b1728',
      color: '#d7ff3f',
      inset:
        'inset 0 -3px 0 rgba(6, 26, 54, 0.34), inset 0 2px 0 rgba(80, 117, 170, 0.42), inset 0 0 0 1px rgba(54, 90, 140, 0.68)',
    },
  ],
  [
    {
      id: 'claude',
      name: 'Claude',
      icon: skill7,
      width: [124, 124],
      bg: '#ff7a14',
      border: '#ff4000',
      color: '#ffffff',
      inset:
        'inset 0 -3px 0 rgba(185, 74, 0, 0.3), inset 0 2px 0 rgba(255, 210, 175, 0.48), inset 0 0 0 1px rgba(255, 178, 120, 0.72)',
    },
    {
      id: 'webflow',
      name: 'Webflow',
      icon: skill8,
      bg: '#176bc9',
      border: '#176bc9',
      color: '#ffffff',
      inset:
        'inset 0 -3px 0 rgba(10, 74, 168, 0.32), inset 0 2px 0 rgba(169, 210, 255, 0.55), inset 0 0 0 1px rgba(125, 181, 255, 0.75)',
    },
  ],
  [
    {
      id: 'ai-development',
      name: 'AI development',
      icon: skill9,
      width: [null, 130],
      bg: '#3f7097',
      border: '#b9ddff',
      color: '#ffffff',
      inset:
        'inset 0 -3px 0 rgba(38, 71, 99, 0.3), inset 0 2px 0 rgba(166, 194, 215, 0.45), inset 0 0 0 1px rgba(123, 163, 193, 0.7)',
    },
    {
      id: 'framer',
      name: 'Framer',
      icon: skill10,
      width: [113, null],
      bg: '#dceeff',
      border: '#b9ddff',
      color: '#0b2447',
      inset:
        'inset 0 -3px 0 rgba(170, 197, 225, 0.24), inset 0 2px 0 rgba(255, 255, 255, 0.55), inset 0 0 0 1px rgba(244, 250, 255, 0.85)',
    },
  ],
  [
    {
      id: 'graphic-design',
      name: 'Graphic design',
      icon: skill11,
      width: [null, 146],
      bg: '#176bc9',
      border: '#000093',
      color: '#ffffff',
      inset:
        'inset 0 -3px 0 rgba(10, 74, 168, 0.32), inset 0 2px 0 rgba(169, 210, 255, 0.55), inset 0 0 0 1px rgba(125, 181, 255, 0.75)',
    },
    {
      id: 'more',
      name: '…and more',
      static: true,
      width: [98, null],
      bg: '#ece9e1',
      border: '#e3e1d5',
      color: '#425515',
      inset:
        'inset 0 -3px 0 rgba(185, 176, 157, 0.22), inset 0 2px 0 rgba(255, 255, 255, 0.45), inset 0 0 0 1px rgba(250, 248, 242, 0.8)',
    },
  ],
];
