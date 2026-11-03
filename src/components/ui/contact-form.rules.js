// The contact form's rules, shared by the form (instant feedback) and the
// server (the check that counts), so both always agree on what is valid and
// say so in the same words. Plain JS: no Vue, no browser APIs.

import {
  DETAILS_MIN,
  FIELD_MESSAGES,
  PROJECT_TYPES,
} from './contact-form.data.js';

export const LIMITS = {
  nameMin: 2,
  name: 120,
  email: 254,
  detailsMin: DETAILS_MIN,
  details: 5000,
  links: 3,
};

// No characters that mean something inside a URL (? & % # / : ;) or a mail
// header (, < > " \), so an address cannot smuggle extra recipients or text
// into a mailto: reply link.
const EMAIL =
  /^[^\s@?&%#/\\:;,<>"()[\]]+@[^\s@?&%#/\\:;,<>"()[\]_]+\.[^\s@?&%#/\\:;,<>"()[\]_.]{2,}$/;

const URL_SOURCE = String.raw`\b(?:https?:\/\/|www\.)\S+`;
const HAS_URL = new RegExp(URL_SOURCE, 'i');
const ALL_URLS = new RegExp(URL_SOURCE, 'gi');
const MARKUP = /<\s*\/?\s*[a-z][^>]*>|\[\/?(?:url|link|img)\b/i;
// Letters of any script (with their accents), joined by single spaces,
// hyphens, apostrophes or dots: "Anne-Marie O'Neil", "J. R. Tolkien",
// "José Ñúñez", "李小龙". No digits, no symbols.
const NAME = /^\p{L}\p{M}*(?:[\s.'’-]{0,2}\p{L}\p{M}*)*\.?$/u;

const text = (value) => (typeof value === 'string' ? value.trim() : '');

// Each rule returns '' when the value is fine, or the message to show.
const RULES = {
  name(value) {
    const name = text(value);
    if (!name) return FIELD_MESSAGES.name.error;
    if (name.length < LIMITS.nameMin) {
      return `Please enter at least ${LIMITS.nameMin} characters.`;
    }
    if (name.length > LIMITS.name) {
      return `Please keep it under ${LIMITS.name} characters.`;
    }
    if (HAS_URL.test(name) || /[<>]/.test(name)) {
      return 'Please enter just your name, without links.';
    }
    if (!NAME.test(name)) {
      return 'Please use letters only; spaces, hyphens and apostrophes are fine.';
    }
    return '';
  },

  email(value) {
    const email = text(value);
    if (!email) return 'Please enter your email address.';
    if (email.length > LIMITS.email) return 'This address is too long.';
    if (!EMAIL.test(email)) return FIELD_MESSAGES.email.error;
    return '';
  },

  projectType(value) {
    return PROJECT_TYPES.includes(text(value))
      ? ''
      : FIELD_MESSAGES.projectType.error;
  },

  details(value) {
    const details = text(value);
    if (details.length < LIMITS.detailsMin) return FIELD_MESSAGES.details.error;
    if (details.length > LIMITS.details) {
      return `Please keep it under ${LIMITS.details} characters.`;
    }
    if (MARKUP.test(details)) {
      return 'Please write plain text, without HTML or BBCode.';
    }
    if ((details.match(ALL_URLS)?.length ?? 0) > LIMITS.links) {
      return `Please include no more than ${LIMITS.links} links.`;
    }
    return '';
  },

  consent(value) {
    return value === true ? '' : FIELD_MESSAGES.consent.error;
  },
};

export const FIELD_NAMES = Object.keys(RULES);

export const validateField = (name, values) => RULES[name](values[name]);

// { field: message } for every field that fails; {} when all is well.
export function validateValues(values) {
  const errors = {};
  for (const name of FIELD_NAMES) {
    const message = validateField(name, values);
    if (message) errors[name] = message;
  }
  return errors;
}
