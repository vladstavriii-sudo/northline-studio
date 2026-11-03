import { validateValues } from '../src/components/ui/contact-form.rules.js';

const PAGE_LIMIT = 300;

const text = (value) => (typeof value === 'string' ? value.trim() : '');

// The form's own rules (contact-form.rules.js), applied again here because
// only the server's check counts. Returns { lead } or { fields }.
export function validateContact(body) {
  const input = body && typeof body === 'object' ? body : {};

  const fields = validateValues(input);
  if (Object.keys(fields).length) return { fields };

  return {
    lead: {
      name: text(input.name),
      email: text(input.email),
      projectType: text(input.projectType),
      details: text(input.details),
      page: text(input.page).slice(0, PAGE_LIMIT),
    },
  };
}
