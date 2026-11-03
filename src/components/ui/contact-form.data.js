export const FORM_FIELDS = [
  {
    name: 'name',
    label: 'Your name',
    type: 'text',
    autocomplete: 'name',
    placeholder: 'e.g. Alex Morgan',
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    autocomplete: 'email',
    placeholder: 'e.g. alex@morgandesign.com',
  },
  {
    name: 'projectType',
    label: 'Project type',
    type: 'select',
    placeholder: 'Select a project type',
  },
  {
    name: 'details',
    label: 'Project details',
    type: 'textarea',
    placeholder:
      'Tell us about your goals, audience, features, and anything else we should know.',
  },
];

export const PROJECT_TYPES = [
  'Website Design & Development',
  'UI/UX Design',
  'Branding & Identity',
  'AI Video & Content',
  'Advertising Campaign',
  'Full Digital Project',
  'I need a consultation',
];

export const DETAILS_MIN = 10;

export const FIELD_MESSAGES = {
  name: {
    error: 'This field is required.',
    success: 'Name validated successfully.',
  },
  email: {
    error: 'Please enter a valid email address.',
    success: 'Email verified.',
  },
  projectType: {
    error: 'Please select one option.',
    success: 'Service category accepted.',
  },
  details: {
    error: `Description must be at least ${DETAILS_MIN} characters.`,
    success: 'Description requirement met.',
  },
  consent: {
    error: 'Please accept the Privacy Policy.',
    success: '',
  },
};
