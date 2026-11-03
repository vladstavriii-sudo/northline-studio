<template>
  <p v-if="signedIn === null" class="boot">Loading…</p>
  <LoginView v-else-if="!signedIn" @signed-in="loadMe" />
  <LeadsView v-else-if="me" :me="me" @signed-out="signedIn = false" />
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';

import { api, signedIn } from './api.js';
import LeadsView from './LeadsView.vue';
import LoginView from './LoginView.vue';

const me = ref(null);

async function loadMe() {
  try {
    const { username, role, permissions } = await api.me();
    me.value = { username, role, can: (p) => permissions.includes(p) };
    signedIn.value = true;
  } catch {
    signedIn.value = false;
  }
}

watch(signedIn, (value) => {
  if (!value) me.value = null;
});

onMounted(loadMe);
</script>

<style scoped>
.boot {
  padding: 40px;
  color: var(--adm-muted);
  text-align: center;
}
</style>
