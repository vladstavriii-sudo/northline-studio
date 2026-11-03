<template>
  <div class="wu-net" :class="{ 'is-active': active }">
    <div class="wu-net__scale">
      <div class="wu-net__routes">
        <span
          v-for="(route, i) in routes"
          :key="`route-${i}`"
          class="wu-net__route"
          :style="{
            left: `${route.x}px`,
            top: `${route.y}px`,
            width: `${route.w}px`,
            height: `${route.h}px`,
          }"
        >
          <svg
            :viewBox="route.viewBox"
            fill="none"
            overflow="visible"
            :style="{
              width: `${route.iw}px`, height: `${route.ih}px`,
              transform: route.transform,
              '--signal-delay': `${0.65 + i * 0.14}s`,
              '--signal-duration': `${2.6 + i * 0.12}s`,
            }"
            aria-hidden="true"
          >
            <path :d="route.path" class="wu-net__wire" />
            <path :d="route.path" pathLength="100" class="wu-net__signal" />
          </svg>
        </span>

        <img
          v-for="(dot, i) in dots"
          :key="`dot-${i}`"
          class="wu-net__dot"
          :src="netDot"
          alt=""
          :style="{ left: `${dot[0]}px`, top: `${dot[1]}px` }"
          loading="lazy"
          decoding="async"
        />
      </div>

      <span
        v-for="(node, i) in nodes"
        :key="`node-${i}`"
        class="wu-net__node"
        :class="{ 'wu-net__node--wide': node.wide }"
        :style="{
          left: `${node.x}px`,
          top: `${node.y}px`,
          background: node.bg,
          borderColor: node.border,
          boxShadow: `${nodeShadow}, ${node.inset}`,
          '--entry-delay': `${0.14 + i * 0.065}s`,
          '--pulse-delay': `${0.9 + i * 0.18}s`,
        }"
      >
        <img :src="node.icon" alt="" loading="lazy" decoding="async" />
      </span>

      <span class="wu-net__logo">
        <img :src="netLogo" alt="Northline" loading="lazy" decoding="async" />
      </span>
    </div>
  </div>
</template>

<script setup>
import netLogo from '@/assets/images/why-us/network-logo.svg';
import netDot from '@/assets/images/why-us/network-dot.svg';
import { routes, dots, nodes, nodeShadow } from './network.data.js';

defineProps({
  active: { type: Boolean, default: false },
});
</script>

<style scoped>
.wu-net {
  position: relative;
  flex: none;
  width: 285px;
  height: 261px;
  margin: auto 0 0 -1.5px;
}

.wu-net__scale {
  position: relative;
  width: 285px;
  height: 261px;
}
.wu-net__routes {
  position: absolute;
  inset: 0;
  transform-origin: 50% 88%;
}
.wu-net__route {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
}
.wu-net__route svg {
  display: block;
  max-width: none;
}
.wu-net__wire {
  stroke: #b4c5d5;
  stroke-dasharray: 1.18 2.94;
  stroke-linecap: round;
  stroke-opacity: 0.7;
  stroke-width: 1.176;
}
.wu-net__signal {
  stroke: #1682ed;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-dasharray: 0.9 99.1;
  stroke-dashoffset: 100;
  opacity: 0;
}
.wu-net.is-active .wu-net__signal {
  animation: wu-signal var(--signal-duration) var(--signal-delay) linear infinite;
}
@keyframes wu-signal {
  0% { stroke-dashoffset: 100; opacity: 0; }
  12%, 82% { opacity: 0.6; }
  100% { stroke-dashoffset: 0; opacity: 0; }
}
.wu-net__dot {
  position: absolute;
  width: 3.53px;
  height: 3.53px;
}
.wu-net__node {
  position: absolute;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border: 1.18px solid;
  border-radius: 50%;
}
.wu-net__node img {
  width: 24px;
  height: 24px;
  object-fit: contain;
}
.wu-net__node--wide img {
  width: 31px;
}
.wu-net__logo {
  position: absolute;
  left: calc(50% + 1.09px);
  top: 200px;
  display: grid;
  place-items: center;
  width: 60px;
  height: 60px;
  translate: -50% 0;
  border: 0.53px solid #176bc9;
  border-radius: 50%;
  background: #1682ed;
  box-shadow:
    0 0 23.53px rgba(22, 130, 237, 0.7),
    inset 0 -1.59px 0 rgba(9, 81, 154, 0.3),
    inset 0 1.06px 0 rgba(184, 222, 255, 0.5),
    inset 0 0 0 0.53px rgba(118, 187, 255, 0.75);
}
.wu-net__logo img {
  width: 36px;
  height: 22px;
}

.wu-net:not(.is-active) :is(.wu-net__logo, .wu-net__node, .wu-net__routes) {
  opacity: 0;
}
.wu-net.is-active .wu-net__logo {
  animation: wu-pop 0.32s both;
}
.wu-net.is-active .wu-net__node {
  animation:
    wu-pop 0.32s var(--entry-delay) both,
    wu-float 3.6s var(--pulse-delay) ease-in-out infinite;
}
.wu-net.is-active .wu-net__routes {
  animation: wu-draw 0.5s 0.18s both;
}
@keyframes wu-float {
  0%, 100% { translate: 0 0; }
  50% { translate: 0 -2px; }
}
.wu-net.is-active .wu-net__logo img {
  animation: wu-logo-pulse 2.8s 0.7s ease-in-out infinite;
}
@keyframes wu-logo-pulse {
  0%, 100% { scale: 1; }
  50% { scale: 1.045; }
}
@keyframes wu-pop {
  from {
    opacity: 0;
    transform: translateY(6px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@keyframes wu-draw {
  from {
    opacity: 0;
    transform: scale(0.92);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@media (width < 1024px) {
  .wu-net {
    width: 229.31px;
    height: 210px;
    margin-left: 1.34px;
  }
  .wu-net__scale {
    scale: 0.8046;
    transform-origin: top left;
  }
}

@media (prefers-reduced-motion: reduce) {
  .wu-net:not(.is-active) :is(.wu-net__logo, .wu-net__node, .wu-net__routes) { opacity: 1; }
  .wu-net.is-active :is(.wu-net__logo, .wu-net__logo img, .wu-net__node, .wu-net__routes, .wu-net__signal) {
    animation: none;
  }
}
</style>
