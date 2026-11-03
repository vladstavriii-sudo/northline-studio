import nexaThumb from '@/assets/images/projects/nexa-ai/thumb.webp';
import nexaWordmark from '@/assets/images/projects/nexa-ai/wordmark.webp';
import nexaDesk from '@/assets/images/projects/nexa-ai/desk.webp';
import nexaPortal from '@/assets/images/projects/nexa-ai/portal.webp';
import nexaBrand from '@/assets/images/projects/nexa-ai/brand.webp';
import nexaPlatform from '@/assets/images/projects/nexa-ai/platform.webp';

import tervexThumb from '@/assets/images/projects/tervex/thumb.webp';
const tervexThumbVideo = tervexThumb;
import tervexWorkspace from '@/assets/images/projects/tervex/workspace.webp';
import tervexLogo from '@/assets/images/projects/tervex/01-logo.webp';
import tervexHeroThumb from '@/assets/images/projects/tervex/hero-thumb.png';
import tervexBrand from '@/assets/images/projects/tervex/brand.webp';
import tervexCards from '@/assets/images/projects/tervex/03-cards.webp';
import tervexMan from '@/assets/images/projects/tervex/man.webp';
import tervexPhone from '@/assets/images/projects/tervex/phone.webp';
import tervexLamp from '@/assets/images/projects/tervex/lamp.webp';

import norvaleThumb from '@/assets/images/projects/norvale/thumb.webp';
const norvaleThumbVideo = norvaleThumb;
import norvaleBrand from '@/assets/images/projects/norvale/mobile.webp';
import norvaleDesk from '@/assets/images/projects/norvale/desk.webp';
import norvalePapers from '@/assets/images/projects/norvale/papers.webp';
import norvaleOutdoor from '@/assets/images/projects/norvale/outdoor.webp';

import placeholderThumb from '@/assets/images/projects/no-project/thumb.webp';
import placeholderForest from '@/assets/images/projects/no-project/forest.webp';
import placeholderLandscape from '@/assets/images/projects/no-project/landscape.webp';

export const isVideoAsset = (src) => /\.(mp4|webm)(\?|$)/i.test(src || '');

const AI_TOOLS = 'Midjourney Runway Pika ChatGPT Leonardo Krea';
const DESIGN_TOOLS = 'figma photoshop after effects premiere pro our brain';

const records = [
  {
    slug: 'nexa-ai',
    heroServices: 'UI/UX Design & Development',
    gallery: [nexaThumb, nexaDesk, nexaPortal],
    thumb: nexaThumb,
    thumbVideo: '',
    page: {
      index: '01',
      screeningDate: '23 May 2026',
      type: 'Digital Product',
      focus: 'AI Workspace',
      aiTools: AI_TOOLS,
      designTools: DESIGN_TOOLS,
      panels: [
        {
          media: nexaThumb,
          text: 'Nexa AI is an all-in-one workspace designed to bring research, content creation and execution into one seamless flow. A clean interface and focused AI tools help turn ideas into finished work faster, without switching between multiple platforms.',
        },
        {
          media: nexaWordmark,
          text: 'Nexa’s identity is built around a soft, fluid wordmark that reflects creativity, flexibility and the evolving nature of AI. Its precise construction is balanced with a translucent, almost weightless treatment to give the brand a distinctive and forward-looking character.',
        },
        {
          media: nexaDesk,
          text: 'The desktop version was designed as a collaborative workspace where ideas can be explored, refined and turned into action. A clean structure, focused content blocks and an approachable interface help make AI-powered work feel simple, organized and ready for everyday use.',
        },
        {
          media: nexaPortal,
          text: 'The portal represents the core of NEXA — a continuous path from question to insight, and from insight to action. Its layered structure reflects how the platform searches, connects and transforms information into clear, usable outcomes.',
        },
        { media: nexaBrand, text: '' },
        { media: nexaPlatform, text: '' },
      ],
    },
  },
  {
    slug: 'tervex',
    heroThumb: tervexHeroThumb,
    heroServices: 'Web Design, 3D & Development',
    gallery: [tervexThumb, tervexLogo, tervexWorkspace],
    thumb: tervexThumbVideo,
    thumbVideo: '',
    page: {
      index: '02',
      screeningDate: '28 Jul 2026',
      type: 'Brand Identity',
      focus: 'Infrastructure Systems',
      aiTools: AI_TOOLS,
      designTools: DESIGN_TOOLS,
      panels: [
        {
          media: tervexThumbVideo,
          text: 'Tervex is a B2B infrastructure brand designed around connected systems, intelligent automation and modular growth. The identity translates this complexity into a clear, precise and scalable visual system.',
        },
        {
          media: tervexLogo,
          text: 'The Tervex mark is built from six modular elements arranged into one connected structure. Its geometry reflects routing, infrastructure and the controlled movement of data across a unified system.',
        },
        {
          media: tervexBrand,
          text: 'The brand extends into a bold campaign system where structure meets emotion. Strong typography, high contrast visuals and the recurring modular form help Tervex communicate stability, scale and a forward-looking technical identity.',
        },
        { media: tervexCards, text: '' },
        { media: tervexMan, text: '' },
        { media: tervexPhone, text: '' },
        {
          media: tervexLamp,
          text: 'Tervex extends across physical and digital touchpoints with one consistent visual language. Strong contrast, warm orange accents and precise layouts create a cohesive system that feels reliable, modern and distinctly technical.',
        },
      ],
    },
  },
  {
    slug: 'norvale',
    heroServices: 'Web Design & Development',
    gallery: [norvaleThumb, norvaleBrand, norvaleOutdoor],
    thumb: norvaleThumbVideo,
    thumbVideo: '',
    page: {
      index: '03',
      screeningDate: '13 Jan 2025',
      type: 'Digital Experience',
      focus: 'Personal Growth',
      aiTools: 'Midjourney • weavy • ChatGPT • Leonardo',
      designTools: 'figma photoshop • after effects • premiere pro • our brain',
      panels: [
        {
          media: norvaleThumbVideo,
          text: 'Norvale is a digital platform built around clarity, direction and steady personal progress. The experience combines a calm editorial interface with thoughtful storytelling, helping users move from uncertainty toward a more structured and intentional path.',
        },
        {
          media: norvaleBrand,
          text: 'The mobile experience brings Norvale’s story into a more intimate, personal format. A clear hierarchy, restrained navigation and the contrast between light and dark states keep the interface focused while preserving the calm, editorial character of the brand.',
        },
        {
          media: norvaleDesk,
          text: 'Norvale’s desktop experience uses immersive visual storytelling to turn progress into a more tangible journey. Layered scenery, focused content cards and a calm editorial rhythm help each stage feel distinct while keeping the overall experience clear and cohesive.',
        },
        {
          media: norvalePapers,
          text: 'The printed piece extends Norvale’s visual language beyond the screen, turning its core ideas — clarity, direction, structure and steady growth — into a tactile editorial format. The minimal layout, restrained typography and symbolic graphics keep the identity consistent while giving the brand a more physical, collectible feel.',
        },
        {
          media: norvaleOutdoor,
          text: 'Norvale’s outdoor communication brings the brand into the physical world while preserving its calm, editorial character. The poster combines the project’s core message with a timeless visual language, turning clarity, direction and growth into a simple public-facing statement.',
        },
      ],
    },
  },
  {
    slug: 'no-project',
    thumb: placeholderThumb,
    thumbVideo: '',
    page: null,
  },
  {
    slug: 'no-project-2',
    thumb: placeholderForest,
    thumbVideo: '',
    page: null,
  },
  {
    slug: 'no-project-3',
    thumb: placeholderLandscape,
    thumbVideo: '',
    page: null,
  },
];

const TITLES = {
  'nexa-ai': 'Nexa AI',
  tervex: 'Tervex',
  norvale: 'Norvale',
  'no-project': 'Your project name',
  'no-project-2': 'Your project name',
  'no-project-3': 'Your project name',
};

export const PROJECTS = records.map((record, index) => ({
  slug: record.slug,
  index: String(index + 1).padStart(2, '0'),
  title: TITLES[record.slug],
  genre: record.page?.type ?? 'Don’t know',
  focus: record.page?.focus ?? 'Don’t know',
  date: record.page?.screeningDate ?? '- -',
  thumb: record.thumb,
  heroThumb: record.heroThumb ?? record.thumb,
  heroServices: record.heroServices ?? record.page?.type ?? '',
  gallery: record.gallery ?? [record.thumb],
  thumbVideo: record.thumbVideo,
  panels: record.page ? record.page.panels.map((panel) => panel.media) : [],
  page: record.page,
}));

export const CASE_STUDIES = PROJECTS.filter((project) => project.page);

export const padIndex = (n) => String(n).padStart(2, '0');

export const findProject = (slug) =>
  PROJECTS.find((project) => project.slug === slug) ?? null;

const PLACEHOLDER_NOTE =
  'Here will be your project Here will be your project Here will be your project Here will be your project Here will be your project Here will be your ';

export const PLACEHOLDER_PAGE = {
  index: padIndex(PROJECTS.length),
  screeningDate: '--',
  type: '--',
  focus: 'Don’t know',
  aiTools: AI_TOOLS,
  designTools: DESIGN_TOOLS,
  panels: Array.from({ length: 4 }, () => ({
    media: '',
    text: PLACEHOLDER_NOTE,
  })),
};

export const PLACEHOLDER_PROJECT = {
  slug: 'your-project',
  title: 'Your project name',
  genre: '--',
  focus: 'Don’t know',
  date: '--',
  thumb: placeholderThumb,
  thumbVideo: '',
  panels: [],
  page: null,
};
