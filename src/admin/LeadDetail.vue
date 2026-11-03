<template>
  <article class="lead">
    <button
      class="lead__back adm-btn adm-btn--ghost"
      type="button"
      @click="emit('back')"
    >
      ← Back to list
    </button>

    <header class="lead__head">
      <div>
        <p class="lead__id">Lead #{{ lead.id }}</p>
        <h1 class="lead__name">{{ lead.name }}</h1>
      </div>
      <span class="pill" :class="`pill--${lead.status}`">
        {{ statusLabel(lead.status) }}
      </span>
    </header>

    <p v-if="isDeleted" class="lead__banner" role="status">
      In the trash since {{ formatDate(lead.deletedAt) }}
      <template v-if="lead.deletedBy"
        >(deleted by {{ lead.deletedBy }})</template
      >. Only owners can see it, and it can be restored.
    </p>

    <dl class="lead__facts">
      <div>
        <dt>Email</dt>
        <dd>
          <a class="lead__link" :href="replyHref">{{ lead.email }}</a>
        </dd>
      </div>
      <div>
        <dt>Project type</dt>
        <dd>{{ lead.projectType }}</dd>
      </div>
      <div>
        <dt>Received</dt>
        <dd>{{ formatDate(lead.createdAt) }}</dd>
      </div>
      <div v-if="lead.page">
        <dt>Page</dt>
        <dd>{{ lead.page }}</dd>
      </div>
      <div>
        <dt>Data processing consent</dt>
        <dd>{{ formatDate(lead.consentAt) }}</dd>
      </div>
    </dl>

    <section class="lead__block">
      <h2 class="lead__label">Project details</h2>
      <p class="lead__details">{{ lead.details }}</p>
    </section>

    <section v-if="canEdit" class="lead__block">
      <h2 class="lead__label">Status</h2>
      <div class="lead__statuses">
        <button
          v-for="s in STATUSES"
          :key="s.value"
          type="button"
          class="adm-btn adm-btn--ghost"
          :class="{ 'is-current': lead.status === s.value }"
          :aria-pressed="lead.status === s.value"
          :disabled="busy"
          @click="save({ status: s.value })"
        >
          {{ s.label }}
        </button>
      </div>
    </section>

    <section class="lead__block">
      <label class="lead__label" :for="`note-${lead.id}`">
        Note (visible only in the admin)
      </label>
      <textarea
        :id="`note-${lead.id}`"
        v-model="note"
        class="adm-input lead__note"
        rows="5"
        maxlength="5000"
        :readonly="!canEdit"
        :disabled="busy"
      ></textarea>
      <div v-if="canEdit" class="lead__actions">
        <button
          class="adm-btn"
          type="button"
          :disabled="busy || note === lead.note"
          @click="save({ note })"
        >
          Save note
        </button>
        <span v-if="saved" class="lead__saved" role="status">Saved</span>
      </div>
    </section>

    <p v-if="error" class="adm-error" role="alert">{{ error }}</p>

    <footer class="lead__footer">
      <a class="adm-btn adm-btn--ghost" :href="replyHref">Reply by email</a>
      <button
        v-if="isDeleted && me.can('restore')"
        class="adm-btn"
        type="button"
        :disabled="busy"
        @click="restore"
      >
        Restore
      </button>
      <button
        v-else-if="!isDeleted && me.can('delete')"
        class="adm-btn adm-btn--danger"
        type="button"
        :disabled="busy"
        @click="remove"
      >
        Move to trash
      </button>
    </footer>

    <section v-if="history.length" class="lead__block">
      <h2 class="lead__label">History</h2>
      <ol class="lead__history">
        <li v-for="entry in history" :key="entry.id">
          <time>{{ formatDate(entry.at) }}</time>
          <span>{{ entry.actor }}: {{ describe(entry) }}</span>
        </li>
      </ol>
    </section>

    <details class="lead__tech">
      <summary>Technical details</summary>
      <p>IP: {{ lead.ip || '—' }}</p>
      <p>Browser: {{ lead.userAgent || '—' }}</p>
      <p>Updated: {{ formatDate(lead.updatedAt) }}</p>
    </details>
  </article>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';

import { STATUSES, api, statusLabel } from './api.js';
import { formatDate } from './format.js';

const props = defineProps({
  lead: { type: Object, required: true },
  me: { type: Object, required: true },
});
const emit = defineEmits(['back', 'updated', 'deleted', 'restored']);

const note = ref(props.lead.note);
const busy = ref(false);
const error = ref('');
const saved = ref(false);
const history = ref([]);

const isDeleted = computed(() => Boolean(props.lead.deletedAt));
const canEdit = computed(() => props.me.can('update') && !isDeleted.value);

const replyHref = computed(() => {
  const subject = encodeURIComponent(
    `Re: ${props.lead.projectType} — Northline studio`,
  );
  // Encoded, so nothing in the address can add recipients or a body.
  return `mailto:${encodeURIComponent(props.lead.email)}?subject=${subject}`;
});

const ACTIONS = {
  delete: 'moved to trash',
  restore: 'restored',
};

function describe({ action, details }) {
  if (action !== 'update') return ACTIONS[action] || action;
  const parts = [];
  if (details.status) {
    parts.push(
      `status ${statusLabel(details.status.from)} → ${statusLabel(details.status.to)}`,
    );
  }
  if (details.note) parts.push('edited the note');
  return parts.join(', ');
}

async function loadHistory() {
  try {
    history.value = (await api.history(props.lead.id)).history;
  } catch {
    history.value = [];
  }
}

onMounted(loadHistory);

let savedTimer = 0;

async function save(changes) {
  busy.value = true;
  error.value = '';
  try {
    const { lead } = await api.updateLead(props.lead.id, changes);
    note.value = lead.note;
    emit('updated', lead);
    loadHistory();
    if ('note' in changes) {
      saved.value = true;
      clearTimeout(savedTimer);
      savedTimer = setTimeout(() => (saved.value = false), 2000);
    }
  } catch (e) {
    error.value = e.message;
  } finally {
    busy.value = false;
  }
}

async function remove() {
  const ok = window.confirm(
    `Move lead #${props.lead.id} from ${props.lead.name} to the trash? It can be restored later.`,
  );
  if (!ok) return;

  busy.value = true;
  error.value = '';
  try {
    await api.deleteLead(props.lead.id);
    emit('deleted', props.lead.id);
  } catch (e) {
    error.value = e.message;
    busy.value = false;
  }
}

async function restore() {
  busy.value = true;
  error.value = '';
  try {
    await api.restoreLead(props.lead.id);
    emit('restored', props.lead.id);
  } catch (e) {
    error.value = e.message;
    busy.value = false;
  }
}
</script>

<style scoped>
.lead {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 760px;
  padding: 24px;
}

.lead__back {
  display: none;
  align-self: flex-start;
}

.lead__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.lead__id {
  color: var(--adm-muted);
  font-size: 12px;
}

.lead__name {
  color: var(--navy-100);
  font-family: var(--font-primary);
  font-size: 30px;
  font-weight: 700;
  line-height: 1.15;
  overflow-wrap: anywhere;
}

.lead__facts {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px 20px;
  padding: 16px;
  border: 1px solid var(--adm-line);
  border-radius: 12px;
  background: var(--adm-surface);
}

.lead__facts dt,
.lead__label {
  display: block;
  margin-bottom: 4px;
  color: var(--adm-muted);
  font-size: 12px;
  font-weight: 500;
}

.lead__facts dd {
  overflow-wrap: anywhere;
}

.lead__link {
  color: var(--navy-300);
  text-decoration: underline;
}

.lead__details {
  padding: 16px;
  border: 1px solid var(--adm-line);
  border-radius: 12px;
  background: var(--adm-surface);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.lead__statuses {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.lead__statuses .is-current {
  border-color: var(--adm-accent);
  color: var(--white);
  background: var(--adm-accent);
}

.lead__note {
  resize: vertical;
}

.lead__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.lead__saved {
  color: var(--green-100);
  font-weight: 500;
}

.lead__footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid var(--adm-line);
}

.lead__banner {
  padding: 12px 16px;
  border: 1px solid var(--red-200);
  border-radius: 12px;
  color: var(--red-200);
  background: var(--adm-surface);
  font-weight: 500;
}

.lead__history {
  display: flex;
  flex-direction: column;
  gap: 6px;
  list-style: none;
  font-size: 13px;
}

.lead__history li {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
}

.lead__history time {
  color: var(--adm-muted);
}

.lead__tech {
  color: var(--adm-muted);
  font-size: 12px;
  overflow-wrap: anywhere;
}

.lead__tech summary {
  margin-bottom: 6px;
  cursor: pointer;
}

@media (width < 860px) {
  .lead {
    padding: 16px;
  }

  .lead__back {
    display: inline-flex;
  }

  .lead__name {
    font-size: 24px;
  }
}
</style>
