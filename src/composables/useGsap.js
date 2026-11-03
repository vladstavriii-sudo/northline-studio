import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(ScrollTrigger, CustomEase);

CustomEase.create('ui', '0.5, 0.5, 0, 1');

export { gsap, ScrollTrigger };
