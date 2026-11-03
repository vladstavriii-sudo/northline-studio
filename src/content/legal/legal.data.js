import { TERMS } from './terms.data.js';
import { PRIVACY } from './privacy.data.js';

export const PLACEHOLDER_PATTERN = /(\[[^\]]+\])/g;

export const isPlaceholder = (part) => /^\[[^\]]+\]$/.test(part);

const LEGAL_DOCS = {
  terms: TERMS,
  privacy: PRIVACY,
};

export const findLegalDoc = (name) => LEGAL_DOCS[name] ?? null;
