import processPoster from '@/assets/images/why-us/process-poster.webp';
import builtPoster from '@/assets/images/why-us/built-poster.webp';
import processVideo from '@/assets/images/why-us/process.mp4';
import builtVideo from '@/assets/images/why-us/built.mp4';

export const cards = [
  {
    key: 'together',
    plate: 'var(--blue-100)',
    plateSide: 'top-left',
    title: 'All together',
    copy: 'From first idea to lasting growth.',
    buttonVariant: 'blue',
    cta: 'One team that knows your business — from first idea to what comes next.',
  },
  {
    key: 'process',
    plate: 'var(--pink-400)',
    plateSide: 'top-right',
    title: 'Clear process',
    copy: 'Four stages, one smooth path from idea to growth.',
    buttonVariant: 'pink',
    cta: 'Four clear stages keep every project moving — from first idea to growth.',
    video: processVideo,
    poster: processPoster,
  },
  {
    key: 'skills',
    plate: 'var(--orange-300)',
    plateSide: 'top-left',
    title: '30+ skill sets',
    copy: 'The tools, systems and skills behind every launch.',
    buttonVariant: 'orange',
    cta: 'The right tools, systems and skills come together for every launch.',
  },
  {
    key: 'built',
    plate: 'var(--lime-300)',
    plateSide: 'top-right',
    title: 'Built for you',
    copy: 'What you need, shaped around where you’re going.',
    buttonVariant: 'lime',
    cta: 'Everything is shaped around what you need — and where you want to go.',
    video: builtVideo,
    poster: builtPoster,
  },
];
