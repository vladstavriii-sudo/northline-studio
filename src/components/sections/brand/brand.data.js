import star from '@/assets/images/brand/brand-1.gif';
import knot from '@/assets/images/brand/brand-2.gif';
import arrow from '@/assets/images/brand/brand-3.gif';
import people from '@/assets/images/brand/brand-4.gif';
import flower from '@/assets/images/brand/brand-5.gif';
import browser from '@/assets/images/brand/brand-6.gif';
import bookmark from '@/assets/images/brand/brand-7.gif';

const SPACE_EM = 0.3125;

const icon = (src, fontSize, spaces, size, rotate = 0) => ({
  src,
  gap: spaces * SPACE_EM,
  size: size / fontSize,
  rotate,
});

const desktop = (src, spaces, size, rotate) =>
  icon(src, 66, spaces, size, rotate);

const mobile = (src, spaces, size, rotate) =>
  icon(src, 26, spaces, size, rotate);

export const BRAND_LAYOUTS = {
  desktop: [
    {
      before: 'We help',
      icon: desktop(star, 8, 126),
      after: 'ambitious brands',
    },
    {
      before: 'turn scattered ideas',
      icon: desktop(knot, 9, 145, 15),
      after: 'into',
    },
    {
      before: 'clear direction,',
      icon: desktop(arrow, 9, 138, 13.23),
      after: 'replace',
    },
    {
      before: 'forgettable',
      icon: desktop(people, 8, 161),
      after: 'visuals with a',
    },
    {
      before: '',
      icon: desktop(flower, 7, 144, 10.86),
      after: 'stronger identity, and make',
    },
    {
      before: 'digital',
      icon: desktop(browser, 9, 125, -7.36),
      after: 'experiences clear,',
    },
    {
      before: 'trusted and',
      icon: desktop(bookmark, 7, 100, 5.68),
      after: 'memorable.',
    },
  ],
  mobile: [
    { before: 'We help', icon: mobile(star, 8, 56), after: 'ambitious' },
    { before: '', icon: null, after: 'brands turn scattered' },
    {
      before: 'ideas',
      icon: mobile(knot, 9, 52, 15),
      after: 'into clear',
    },
    {
      before: 'direction,',
      icon: mobile(arrow, 9, 59, 13.23),
      after: 'replace',
    },
    {
      before: 'forgettable',
      icon: mobile(people, 8, 64),
      after: 'visuals',
    },
    {
      before: 'with a',
      icon: mobile(flower, 8, 56, 10.86),
      after: 'stronger',
    },
    { before: '', icon: null, after: 'identity, and make' },
    {
      before: 'digital',
      icon: mobile(browser, 8, 60, -7.5),
      after: 'experiences',
    },
    { before: '', icon: null, after: 'clear, trusted' },
    {
      before: 'and',
      icon: mobile(bookmark, 8, 46, 6),
      after: 'memorable.',
    },
  ],
};

export const BRAND_TEXT = BRAND_LAYOUTS.desktop
  .map(({ before, after }) => [before, after].filter(Boolean).join(' '))
  .join(' ');
