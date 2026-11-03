<template>
  <div class="leads" :class="{ 'has-selection': selected }">
    <header class="bar">
      <p class="bar__title">Northline · leads</p>
      <div class="bar__user">
        <span class="bar__name"
          >{{ me.username }} · {{ ROLE_LABELS[me.role] || me.role }}</span
        >
        <button class="adm-btn adm-btn--ghost" type="button" @click="logout">
          Sign out
        </button>
      </div>
    </header>

    <section class="list" aria-label="Leads">
      <div class="toolbar">
        <nav class="tabs" aria-label="Status">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            type="button"
            class="tabs__item"
            :class="{ 'is-active': status === tab.value }"
            :aria-pressed="status === tab.value"
            @click="setStatus(tab.value)"
          >
            {{ tab.label }}
            <span class="tabs__count">{{ tab.count }}</span>
          </button>
        </nav>

        <div class="toolbar__row">
          <label class="toolbar__search">
            <span class="adm-sr">Search</span>
            <input
              v-model="query"
              class="adm-input"
              type="search"
              placeholder="Name, email, message, note…"
            />
          </label>
          <a
            v-if="me.can('export') && !inTrash"
            class="adm-btn adm-btn--ghost"
            :href="api.csvUrl({ status, q: query.trim() })"
            download
            >CSV</a
          >
        </div>
      </div>

      <p v-if="error" class="list__note adm-error" role="alert">{{ error }}</p>
      <p v-else-if="loading && !items.length" class="list__note">Loading…</p>
      <p v-else-if="!items.length" class="list__note">
        {{
          query
            ? 'Nothing found.'
            : inTrash
              ? 'The trash is empty.'
              : 'No leads yet.'
        }}
      </p>

      <ul v-else class="list__items" :class="{ 'is-loading': loading }">
        <li v-for="lead in items" :key="lead.id">
          <button
            type="button"
            class="row"
            :class="{ 'is-active': selected?.id === lead.id }"
            @click="selected = lead"
          >
            <span class="row__top">
              <span class="row__name">{{ lead.name }}</span>
              <span class="row__date">{{ formatDate(lead.createdAt) }}</span>
            </span>
            <span class="row__meta">
              <span class="pill" :class="`pill--${lead.status}`">
                {{ statusLabel(lead.status) }}
              </span>
              {{ lead.projectType }}
            </span>
            <span class="row__preview">{{ lead.details }}</span>
          </button>
        </li>
      </ul>

      <div v-if="pages > 1" class="pager">
        <button
          class="adm-btn adm-btn--ghost"
          type="button"
          :disabled="page <= 1 || loading"
          @click="goTo(page - 1)"
        >
          ←
        </button>
        <span>{{ page }} / {{ pages }}</span>
        <button
          class="adm-btn adm-btn--ghost"
          type="button"
          :disabled="page >= pages || loading"
          @click="goTo(page + 1)"
        >
          →
        </button>
      </div>
    </section>

    <LeadDetail
      v-if="selected"
      :key="selected.id"
      class="detail"
      :lead="selected"
      :me="me"
      @back="selected = null"
      @updated="onUpdated"
      @deleted="onRemoved"
      @restored="onRemoved"
    />
    <p v-else class="detail detail--empty">Select a lead on the left.</p>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

import { ROLE_LABELS, STATUSES, api, statusLabel } from './api.js';
import LeadDetail from './LeadDetail.vue';
import { formatDate } from './format.js';

const props = defineProps({ me: { type: Object, required: true } });
const emit = defineEmits(['signed-out']);

const REFRESH_MS = 60_000;
const TRASH = 'deleted';

const status = ref('');
const query = ref('');
const page = ref(1);
const pageSize = ref(50);
const total = ref(0);
const items = ref([]);
const counts = ref({});
const loading = ref(false);
const error = ref('');
// Kept apart from items, so a lead stays open after a status change moves
// it out of the current tab.
const selected = ref(null);

const inTrash = computed(() => status.value === TRASH);

const pages = computed(() =>
  Math.max(1, Math.ceil(total.value / pageSize.value)),
);

const tabs = computed(() => {
  const c = counts.value;
  const active = (c.new || 0) + (c.in_progress || 0) + (c.done || 0);
  return [
    { value: '', label: 'Active', count: active },
    ...STATUSES.map((s) => ({
      value: s.value,
      label: s.plural,
      count: c[s.value] || 0,
    })),
    ...(props.me.can('trash')
      ? [{ value: TRASH, label: 'Trash', count: c.deleted || 0 }]
      : []),
  ];
});

let requestId = 0;

async function load() {
  const id = ++requestId;
  loading.value = true;
  try {
    const data = await api.listLeads({
      status: inTrash.value ? '' : status.value,
      deleted: inTrash.value,
      q: query.value.trim(),
      page: page.value,
    });
    if (id !== requestId) return;
    items.value = data.items;
    total.value = data.total;
    pageSize.value = data.pageSize;
    counts.value = data.counts;
    const fresh = data.items.find((lead) => lead.id === selected.value?.id);
    if (fresh) selected.value = fresh;
    error.value = '';
  } catch (e) {
    if (id === requestId) error.value = e.message;
  } finally {
    if (id === requestId) loading.value = false;
  }
}

function setStatus(value) {
  status.value = value;
  page.value = 1;
  load();
}

function goTo(n) {
  page.value = n;
  load();
}

let searchTimer = 0;
watch(query, () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    page.value = 1;
    load();
  }, 300);
});

function onUpdated(lead) {
  selected.value = lead;
  load();
}

// Deleted or restored: either way it has left the current list.
function onRemoved(id) {
  items.value = items.value.filter((item) => item.id !== id);
  selected.value = null;
  load();
}

async function logout() {
  await api.logout().catch(() => {});
  emit('signed-out');
}

let refreshTimer = 0;
onMounted(() => {
  load();
  refreshTimer = setInterval(() => {
    if (document.visibilityState === 'visible') load();
  }, REFRESH_MS);
});

onBeforeUnmount(() => {
  clearInterval(refreshTimer);
  clearTimeout(searchTimer);
});
</script>

<style scoped>
.leads {
  display: grid;
  grid-template-columns: minmax(320px, 440px) 1fr;
  grid-template-rows: auto 1fr;
  height: 100vh;
}

.bar {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 16px;
  border-bottom: 3px solid var(--black);
  color: var(--white);
  background: var(--navy-200);
}

.bar__title {
  font-family: var(--font-display);
  font-size: 28px;
  line-height: 1;
}

.bar__user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bar__name {
  opacity: 0.8;
}

.list {
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-right: 1px solid var(--adm-line);
  background: var(--adm-surface);
}

.toolbar {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border-bottom: 1px solid var(--adm-line);
}

.toolbar__row {
  display: flex;
  gap: 8px;
}

.toolbar__search {
  flex: 1;
}

.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tabs__item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border: 1px solid var(--adm-line);
  border-radius: 999px;
  color: var(--adm-ink);
  font-size: 13px;
}

.tabs__item.is-active {
  border-color: var(--adm-accent);
  color: var(--white);
  background: var(--adm-accent);
}

.tabs__count {
  font-size: 11px;
  opacity: 0.7;
}

.list__note {
  padding: 24px 16px;
  color: var(--adm-muted);
}

.list__items {
  flex: 1;
  overflow-y: auto;
  transition: opacity 0.15s;
}

.list__items.is-loading {
  opacity: 0.6;
}

.row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  padding: 12px 14px;
  border-bottom: 1px solid var(--adm-line);
  border-left: 4px solid transparent;
  color: inherit;
  text-align: left;
}

.row:hover {
  background: var(--blue-700);
}

.row.is-active {
  border-left-color: var(--adm-accent);
  background: var(--blue-500);
}

.row__top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.row__name {
  overflow: hidden;
  color: var(--navy-100);
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row__date {
  flex-shrink: 0;
  color: var(--adm-muted);
  font-size: 12px;
}

.row__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--adm-muted);
  font-size: 12px;
}

.row__preview {
  display: -webkit-box;
  overflow: hidden;
  color: var(--adm-ink);
  font-size: 13px;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 10px;
  border-top: 1px solid var(--adm-line);
}

.detail {
  min-height: 0;
  overflow-y: auto;
}

.detail--empty {
  display: grid;
  place-items: center;
  color: var(--adm-muted);
}

@media (width < 860px) {
  .leads {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }

  .list {
    border-right: 0;
  }

  .detail--empty,
  .has-selection .list {
    display: none;
  }

  .bar__name {
    display: none;
  }
}
</style>

<style>
.pill {
  display: inline-block;
  padding: 1px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.pill--new {
  color: var(--black);
  background: var(--lime-400);
}

.pill--in_progress {
  color: var(--black);
  background: var(--yellow-100);
}

.pill--done {
  color: var(--white);
  background: var(--green-100);
}

.pill--archived {
  color: var(--white);
  background: var(--gray-400);
}
</style>
