import { ref } from 'vue';

export const STATUSES = [
  { value: 'new', label: 'New', plural: 'New' },
  { value: 'in_progress', label: 'In progress', plural: 'In progress' },
  { value: 'done', label: 'Done', plural: 'Done' },
  { value: 'archived', label: 'Archived', plural: 'Archive' },
];

export const ROLE_LABELS = {
  owner: 'owner',
  manager: 'manager',
  viewer: 'viewer',
};

export const statusLabel = (value) =>
  STATUSES.find((s) => s.value === value)?.label || value;

// Flips to false whenever the server says the session is gone, so the app
// can drop back to the sign-in screen from anywhere.
export const signedIn = ref(null);

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

const MESSAGES = {
  403: 'Your role does not allow this.',
  404: 'Lead not found — it may have been deleted.',
  409: 'Restore the lead first.',
  429: 'Too many attempts. Try again in a few minutes.',
  503: 'The server is busy. Try again in a moment.',
};

const query = (params) => {
  const search = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value),
  ).toString();
  return search ? `?${search}` : '';
};

async function request(method, path, body) {
  let response;
  try {
    response = await fetch(`/api/admin${path}`, {
      method,
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError('Cannot reach the server.', 0);
  }

  const data = await response.json().catch(() => null);

  if (response.status === 401 && path !== '/login') signedIn.value = false;
  if (!response.ok || !data?.ok) {
    throw new ApiError(
      MESSAGES[response.status] ||
        data?.error ||
        `Server error (${response.status}).`,
      response.status,
    );
  }
  return data;
}

export const api = {
  me: () => request('GET', '/me'),
  login: (username, password) =>
    request('POST', '/login', { username, password }),
  logout: () => request('POST', '/logout'),

  listLeads: ({ status = '', q = '', page = 1, deleted = false } = {}) =>
    request(
      'GET',
      `/leads${query({ status, q, page: page > 1 && page, deleted: deleted && '1' })}`,
    ),
  history: (id) => request('GET', `/leads/${id}/history`),
  updateLead: (id, changes) => request('PATCH', `/leads/${id}`, changes),
  deleteLead: (id) => request('DELETE', `/leads/${id}`),
  restoreLead: (id) => request('POST', `/leads/${id}/restore`),

  csvUrl: ({ status = '', q = '' } = {}) =>
    `/api/admin/leads.csv${query({ status, q })}`,
};
