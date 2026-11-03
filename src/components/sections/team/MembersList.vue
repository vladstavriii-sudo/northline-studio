<template>
  <div class="members">
    <div
      v-for="member in members"
      :key="member.role"
      class="members__item"
      :data-role="member.role"
      :style="{
        '--x': member.x,
        '--y': member.y,
        '--size': member.size,
        '--label': member.label,
        '--nx': member.nx,
        '--ny': member.ny,
        '--nsize': member.nsize,
        '--nlabel': member.nlabel,
        '--nlift': member.nlift,
        '--nlabelw': member.nlabelw,
        '--avatar-bg': member.background,
        '--avatar-ring': member.ring,
      }"
    >
      <span class="members__pulse" aria-hidden="true"></span>
      <span class="members__avatar">
        <img
          :src="member.image"
          alt=""
          width="320"
          height="320"
          loading="lazy"
          decoding="async"
        />
      </span>
      <span class="members__role" :class="`tag--${member.color}`">
        {{ member.role }}
      </span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  members: { type: Array, default: () => [] },
});
</script>

<style scoped>
.members {
  position: absolute;
  inset: 0;
}

.members__item {
  position: absolute;
  left: calc(var(--x) * var(--u));
  top: calc(var(--y) * var(--u));
  width: calc(var(--size) * var(--u));
}

.members__avatar {
  position: relative;
  display: block;
  overflow: hidden;
  aspect-ratio: 1;
  border-radius: 50%;
  background: var(--avatar-bg);
}

.members__avatar::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: var(--avatar-ring);
  pointer-events: none;
}

.members__avatar img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.members__role {
  position: absolute;
  left: 50%;
  top: calc((var(--size) - var(--lift, 17)) * var(--u));
  translate: -50% 0;
  padding: calc(4 * var(--u)) calc(7 * var(--u));
  border-radius: calc(4 * var(--u));
  font-family: var(--font-mono);
  font-size: calc(var(--label) * var(--u));
  font-weight: 500;
  line-height: normal;
  white-space: nowrap;
  text-align: center;
}

@media (width < 1440px) {
  .members__item {
    left: calc(var(--nx) * var(--u));
    top: calc((var(--ny) - var(--narrow-top, 0)) * var(--u));
    width: calc(var(--nsize) * var(--u));
  }

  .members__role {
    top: calc((var(--nsize) - var(--nlift)) * var(--u));
    max-width: calc((var(--nlabelw) + 6) * var(--u));
    overflow: hidden;
    border-radius: calc(5 * var(--u));
    font-size: calc(var(--nlabel) * var(--u));
    text-overflow: ellipsis;
  }
}
/* The ring expands separately; the portrait and its label stay still. */
.members__pulse {
  position: absolute;
  inset: 0 0 auto;
  aspect-ratio: 1;
  border: 2px solid #6b9bc9;
  border-radius: 50%;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}
</style>
