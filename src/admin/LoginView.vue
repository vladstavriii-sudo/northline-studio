<template>
  <main class="login">
    <form class="login__card" novalidate @submit.prevent="submit">
      <p class="login__brand">Northline studio</p>
      <h1 class="login__title">Leads</h1>

      <label class="login__field">
        <span>Username</span>
        <input
          v-model.trim="username"
          class="adm-input"
          name="username"
          autocomplete="username"
          autocapitalize="off"
          spellcheck="false"
          required
          :disabled="busy"
        />
      </label>

      <label class="login__field">
        <span>Password</span>
        <input
          v-model="password"
          class="adm-input"
          type="password"
          name="password"
          autocomplete="current-password"
          required
          :disabled="busy"
        />
      </label>

      <p v-if="error" class="adm-error" role="alert">{{ error }}</p>

      <button class="adm-btn login__submit" type="submit" :disabled="busy">
        {{ busy ? 'Checking…' : 'Sign in' }}
      </button>
    </form>
  </main>
</template>

<script setup>
import { ref } from 'vue';
import { api } from './api.js';

const emit = defineEmits(['signed-in']);

const username = ref('');
const password = ref('');
const busy = ref(false);
const error = ref('');

const MESSAGES = {
  401: 'Wrong username or password.',
  429: 'Too many attempts. Try again in a few minutes.',
};

async function submit() {
  if (!username.value || !password.value) {
    error.value = 'Enter your username and password.';
    return;
  }

  busy.value = true;
  error.value = '';
  try {
    await api.login(username.value, password.value);
    password.value = '';
    emit('signed-in');
  } catch (e) {
    error.value = MESSAGES[e.status] || e.message;
  } finally {
    busy.value = false;
  }
}
</script>

<style scoped>
.login {
  display: grid;
  place-items: center;
  min-height: 100vh;
  padding: 16px;
}

.login__card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: min(380px, 100%);
  padding: 28px 24px 24px;
  border: 3px solid var(--black);
  border-radius: 16px;
  background: var(--adm-surface);
  box-shadow: 10px 10px 0 var(--lime-400);
}

.login__brand {
  color: var(--adm-muted);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.login__title {
  margin-bottom: 6px;
  color: var(--navy-100);
  font-family: var(--font-display);
  font-size: 44px;
  font-weight: 400;
  line-height: 1;
}

.login__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: var(--navy-100);
  font-weight: 500;
}

.login__submit {
  margin-top: 6px;
  min-height: 44px;
}
</style>
