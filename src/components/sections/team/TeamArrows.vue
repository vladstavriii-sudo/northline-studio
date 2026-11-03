<template>
  <svg
    class="arrows"
    :viewBox="`0 0 ${fan.viewBox.w} ${fan.viewBox.h}`"
    preserveAspectRatio="none"
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <linearGradient
        :id="gradientId"
        gradientUnits="userSpaceOnUse"
        :x1="fan.gradient.x1"
        :y1="fan.gradient.y1"
        :x2="fan.gradient.x2"
        :y2="fan.gradient.y2"
      >
        <stop :stop-color="fan.gradient.from" />
        <stop
          offset="1"
          :stop-color="fan.gradient.to"
          :stop-opacity="fan.gradient.toOpacity"
        />
      </linearGradient>

      <filter
        :id="blurId"
        x="-40"
        y="-40"
        :width="fan.viewBox.w + 80"
        :height="fan.viewBox.h + 80"
        filterUnits="userSpaceOnUse"
        color-interpolation-filters="sRGB"
      >
        <feGaussianBlur :std-deviation="fan.blur" />
      </filter>

      <mask :id="maskId">
        <g
          v-for="arrow in fan.arrows"
          :key="arrow.role"
          class="arrows__wedge"
          :data-role="arrow.role"
        >
          <polygon :points="arrow.wedge" fill="#fff" />
        </g>
      </mask>
    </defs>

    <g :transform="fan.rotate || undefined">
      <g :mask="`url(#${maskId})`">
        <path
          :d="fan.path"
          :fill="`url(#${gradientId})`"
          :fill-opacity="fan.fillOpacity"
          :filter="`url(#${blurId})`"
        />
      </g>
    </g>
  </svg>
</template>

<script setup>
import { useId } from 'vue';

defineProps({
  fan: { type: Object, required: true },
});

const uid = useId();
const gradientId = `team-arrow-grad-${uid}`;
const blurId = `team-arrow-blur-${uid}`;
const maskId = `team-arrow-mask-${uid}`;
</script>

<style scoped>
.arrows {
  display: block;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>
