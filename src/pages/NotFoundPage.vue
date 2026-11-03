<template>
  <main class="notfound">
    <p class="notfound__code">404</p>
    <h1 class="notfound__title">Page not found</h1>
    <p class="notfound__text">
      The page you're after doesn't exist or has moved.
    </p>
    <RouterLink to="/" class="notfound__link">Back to home</RouterLink>
  </main>
</template>

<script setup></script>

<style scoped>
.notfound {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: var(--container-padding);
  text-align: center;
  background: var(--blue-700);
  color: var(--navy-100);
}

.notfound__code {
  font-family: var(--font-display);
  font-size: clamp(80px, 18vw, 180px);
  line-height: 1;
  color: var(--blue-100);
}

.notfound__title {
  font-size: clamp(28px, 5vw, 48px);
}

.notfound__text {
  font-family: var(--font-mono);
  font-size: 16px;
}

.notfound__link {
  margin-top: 16px;
  font-family: var(--font-mono);
  font-weight: 500;
  color: var(--blue-100);
  text-decoration: underline;
  text-underline-offset: 4px;
}
</style>
