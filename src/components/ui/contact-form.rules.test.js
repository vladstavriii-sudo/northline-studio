import { describe, expect, it } from 'vitest';

import { FIELD_MESSAGES } from './contact-form.data.js';
import { LIMITS, validateField, validateValues } from './contact-form.rules.js';

const VALID = {
  name: 'Alex Morgan',
  email: 'alex@morgandesign.com',
  projectType: 'UI/UX Design',
  details: 'A marketing site with a case archive.',
  consent: true,
};

const check = (name, value) => validateField(name, { ...VALID, [name]: value });

describe('contact form rules', () => {
  it('accepts a normal enquiry', () => {
    expect(validateValues(VALID)).toEqual({});
  });

  it('flags every field of an empty form', () => {
    expect(Object.keys(validateValues({}))).toEqual([
      'name',
      'email',
      'projectType',
      'details',
      'consent',
    ]);
  });

  describe('name', () => {
    it.each([
      ['', FIELD_MESSAGES.name.error],
      ['   ', FIELD_MESSAGES.name.error],
      ['A', 'Please enter at least 2 characters.'],
      ['x'.repeat(LIMITS.name + 1), 'Please keep it under 120 characters.'],
      [
        'Visit http://spam.example',
        'Please enter just your name, without links.',
      ],
      ['www.spam.example', 'Please enter just your name, without links.'],
      ['<b>Alex</b>', 'Please enter just your name, without links.'],
      [
        '12345',
        'Please use letters only; spaces, hyphens and apostrophes are fine.',
      ],
      [
        'asd asd123$#@!#$',
        'Please use letters only; spaces, hyphens and apostrophes are fine.',
      ],
      [
        'Alex2',
        'Please use letters only; spaces, hyphens and apostrophes are fine.',
      ],
      [
        'Alex_Morgan',
        'Please use letters only; spaces, hyphens and apostrophes are fine.',
      ],
      [
        'Alex!!',
        'Please use letters only; spaces, hyphens and apostrophes are fine.',
      ],
      [
        'Alex @ Morgan',
        'Please use letters only; spaces, hyphens and apostrophes are fine.',
      ],
      [
        '-Alex',
        'Please use letters only; spaces, hyphens and apostrophes are fine.',
      ],
      [
        'Alex -- -- Morgan',
        'Please use letters only; spaces, hyphens and apostrophes are fine.',
      ],
    ])('refuses %j', (value, message) => {
      expect(check('name', value)).toBe(message);
    });

    it.each([
      'Al',
      'Анна Петрова',
      'José Ñúñez',
      "O'Brien-Smith",
      'D’Angelo',
      'J. R. R. Tolkien',
      'Mary Jr.',
      'Li 李',
      '李小龙',
      'Nguyễn Văn An',
    ])('accepts %j', (value) => {
      expect(check('name', value)).toBe('');
    });
  });

  describe('email', () => {
    it.each([
      ['', 'Please enter your email address.'],
      ['alex', FIELD_MESSAGES.email.error],
      ['alex@morgan', FIELD_MESSAGES.email.error],
      ['a b@c.com', FIELD_MESSAGES.email.error],
      ['me@x.io?cc=attacker%40evil.io', FIELD_MESSAGES.email.error],
      ['me@x.io#x', FIELD_MESSAGES.email.error],
      [`${'a'.repeat(250)}@x.io`, 'This address is too long.'],
    ])('refuses %j', (value, message) => {
      expect(check('email', value)).toBe(message);
    });

    it.each(['a@b.co', 'first.last+tag@sub.example.org', ' alex@x.io '])(
      'accepts %j',
      (value) => {
        expect(check('email', value)).toBe('');
      },
    );
  });

  it('wants one of the listed project types', () => {
    expect(check('projectType', '')).toBe(FIELD_MESSAGES.projectType.error);
    expect(check('projectType', 'Something else')).toBe(
      FIELD_MESSAGES.projectType.error,
    );
  });

  describe('details', () => {
    it.each([
      ['Too short', FIELD_MESSAGES.details.error],
      ['x'.repeat(LIMITS.details + 1), 'Please keep it under 5000 characters.'],
      [
        'Hello <a href="http://x.example">click</a>',
        'Please write plain text, without HTML or BBCode.',
      ],
      [
        'See [url=http://x.example]this[/url]',
        'Please write plain text, without HTML or BBCode.',
      ],
      [
        'http://a.example http://b.example www.c.example https://d.example',
        'Please include no more than 3 links.',
      ],
    ])('refuses %j', (value, message) => {
      expect(check('details', value)).toBe(message);
    });

    it.each([
      'Our site is https://example.com, please have a look.',
      'Budget is under 5k and > 2k, timeline < 3 months.',
      'We love <3 pixel art.',
    ])('accepts %j', (value) => {
      expect(check('details', value)).toBe('');
    });
  });

  it('needs the consent box ticked, not just something truthy', () => {
    expect(check('consent', 'yes')).toBe(FIELD_MESSAGES.consent.error);
    expect(check('consent', true)).toBe('');
  });
});
