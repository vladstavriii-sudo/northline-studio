<template>
  <component
    :is="href ? 'a' : 'button'"
    :href="href || undefined"
    :type="href ? undefined : 'button'"
    class="link"
    :class="`link--${variant} ${classes}`"
  >
    <span class="link__text">
      <slot />
    </span>

    <span v-if="hasIcon" class="link__icon">
      <img :src="arrowIcon" alt="" />
    </span>
  </component>
</template>

<script setup>
import arrowIcon from '@/assets/icons/arrow.svg';

defineProps({
  href: {
    type: String,
    default: '',
  },
  variant: {
    type: String,
    default: 'lime',
  },
  classes: {
    type: String,
    default: '',
  },
  hasIcon: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped>
.link {
  position: relative;
  isolation: isolate;
  display: inline-flex;
  align-items: center;
  gap: 14px;
  border: 1px solid var(--black);
  border-radius: 8px;
  max-width: 220px;
  padding: 8px 8px 8px 14px;
  font-family: var(--font-mono);
  font-weight: 600;
  color: var(--black);
  transition:
    color 0.3s var(--transition-timing),
    border-color 0.3s var(--transition-timing),
    box-shadow 0.2s ease;
}

.link__text,
.link__icon {
  position: relative;
  z-index: 1;
}

.link__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  overflow: hidden;
  background: var(--black);
  transition:
    background-color 0.3s var(--transition-timing),
    box-shadow 0.3s var(--transition-timing);
}

.link__icon img {
  display: block;
  width: 14px;
  height: 14px;
  transition: filter 0.3s var(--transition-timing);
}

.link::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: inherit;
  background: var(--black);
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 0.3s var(--transition-timing);
}

.link:hover {
  color: var(--white);
  border-color: var(--link-fill);
}
.link:hover::before {
  transform: scaleX(1);
}
.link:hover .link__icon {
  background: var(--link-fill);
  box-shadow: var(--link-fill-shadow, none);
}
.link:hover .link__icon img {
  filter: var(--link-hover-arrow, invert(1));
  animation: link-arrow-swap 0.4s var(--transition-timing);
}

@keyframes link-arrow-swap {
  0% {
    transform: translate(0, 0);
  }
  40% {
    transform: translate(150%, -150%);
  }
  41% {
    transform: translate(-150%, 150%);
  }
  100% {
    transform: translate(0, 0);
  }
}

.link--lime {
  --link-fill: var(--lime-400);
  --link-fill-shadow: var(--shadow-green);
  background-color: var(--lime-400);
  box-shadow: var(--shadow-green);
}
.link--blue {
  --link-fill: var(--blue-100);
  --link-fill-shadow: var(--shadow-blue);
  --link-hover-arrow: none;
  color: var(--white);
  background-color: var(--blue-100);
  box-shadow: var(--shadow-blue);
}
.link--pink {
  --link-fill: var(--pink-200);
  color: var(--black);
  background-color: var(--pink-200);
  box-shadow:
    0 -3px 0 rgba(185, 91, 141, 0.3) inset,
    0 2px 0 rgba(255, 240, 247, 0.5) inset;
}
.link--orange {
  --link-fill: var(--orange-300);
  color: var(--white);
  background-color: var(--orange-300);
  box-shadow:
    0 -3px 0 rgba(185, 74, 0, 0.3) inset,
    0 2px 0 rgba(255, 210, 175, 0.5) inset;
}
.link--light-lime {
  --link-fill: var(--lime-300);
  --link-fill-shadow: var(--shadow-green);
  color: var(--black);
  background-color: var(--lime-300);
  box-shadow: var(--shadow-green);
}

@media (prefers-reduced-motion: reduce) {
  .link,
  .link::before,
  .link__icon,
  .link__icon img {
    transition: none;
  }
  .link:hover .link__icon img {
    animation: none;
  }
}
</style>
