<template>
  <div class="wu-skills">
    <div class="wu-skills__list" role="group" aria-label="Skill set selection">
      <div v-for="(row, r) in skillRows" :key="r" class="wu-skills__row">
        <template v-for="skill in row" :key="skill.id">
          <span
            v-if="skill.static"
            class="wu-skills__item wu-skills__item--static"
            :style="skillStyle(skill)"
          >
            <span class="wu-skills__label">{{ skill.name }}</span>
          </span>
          <button
            v-else
            type="button"
            class="wu-skills__item"
            :class="{ 'is-off': !isOn(skill.id) }"
            :style="skillStyle(skill)"
            :aria-pressed="isOn(skill.id)"
            @click="toggleSkill(skill.id)"
          >
            <span class="wu-skills__name">
              <img
                class="wu-skills__icon"
                :src="skill.icon"
                alt=""
                loading="lazy"
                decoding="async"
              />
              <span class="wu-skills__label">{{ skill.name }}</span>
            </span>
            <svg class="wu-skills__toggle" viewBox="0 0 21 13.9" aria-hidden="true">
              <rect x="1" y="0.9" width="19" height="11" rx="5.5" fill="#fff" />
              <rect class="wu-skills__track" x="2" y="1.9" width="17" height="9" rx="4.5" />
              <circle class="wu-skills__thumb" cx="7" cy="6.4" r="4" fill="#fff" />
            </svg>
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue';
import { gsap } from '@/composables/useGsap';
import { prefersReducedMotion } from '@/composables/useReducedMotion';
import {
  skillRows,
  SKILLS_OFF_AT_REST,
  SKILL_OFF_INSET,
} from './skills.data.js';

const props = defineProps({ active: { type: Boolean, default: false } });
const enabledAtRest = skillRows.flat()
  .filter((skill) => !skill.static && !SKILLS_OFF_AT_REST.includes(skill.id))
  .map((skill) => skill.id);
const selectedSkills = ref([...enabledAtRest]);
const switchOrder = skillRows.flat().filter(skill => !skill.static).map(skill => skill.id);
let entrance;
function setSkill(id, enabled) {
  selectedSkills.value = enabled
    ? [...selectedSkills.value.filter(item => item !== id), id]
    : selectedSkills.value.filter(item => item !== id);
}
watch(() => props.active, (active) => {
  entrance?.kill();
  if (!active || prefersReducedMotion()) return;
  selectedSkills.value = [...enabledAtRest];
  entrance = gsap.timeline({ repeat: -1, repeatDelay: 0.7 });
  // The reference changes one switch at a time in reading order. A second
  // pass restores the initial mixture, so the cycle never snaps all rows.
  switchOrder.forEach((id, i) => entrance.call(() => {
    setSkill(id, !enabledAtRest.includes(id));
  }, [], 0.65 + i * 0.45));
  const restoreAt = 0.65 + switchOrder.length * 0.45 + 0.6;
  switchOrder.forEach((id, i) => entrance.call(() => {
    setSkill(id, enabledAtRest.includes(id));
  }, [], restoreAt + i * 0.45));
}, { immediate: true });
onBeforeUnmount(() => entrance?.kill());

function isOn(id) {
  return selectedSkills.value.includes(id);
}

function flex(width) {
  return width ? `0 0 ${width}px` : '1 1 0';
}

function skillStyle(skill) {
  const [desktop, mobile] = skill.width ?? [];
  const layout = { '--flex': flex(desktop), '--flex-m': flex(mobile) };

  if (skill.static || isOn(skill.id)) {
    return {
      ...layout,
      '--skill-bg': skill.bg,
      '--skill-border': skill.border,
      '--skill-color': skill.color,
      '--skill-inset': skill.inset,
    };
  }
  return { ...layout, '--skill-inset': SKILL_OFF_INSET };
}

function toggleSkill(id) {
  entrance?.kill();
  selectedSkills.value = isOn(id)
    ? selectedSkills.value.filter((item) => item !== id)
    : [...selectedSkills.value, id];
}
</script>

<style scoped>
.wu-skills {
  --skill-gap: 12px;
  --skill-font: 10px;
  --skill-pad: 6px 8px 6px 6px;

  position: relative;
  flex: 1;
  min-height: 0;
  margin-top: 24px;
}
.wu-skills__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 286px;
  height: 100%;
  padding-bottom: 8px;
  overflow: visible;
}
.wu-skills__row {
  display: flex;
  flex-shrink: 0;
  gap: var(--skill-gap);
}

.wu-skills__item {
  display: flex;
  flex: var(--flex);
  align-items: center;
  justify-content: space-between;
  min-width: 0;
  height: 28px;
  padding: var(--skill-pad);
  border: 1px solid var(--skill-border);
  border-radius: 8px;
  background: var(--skill-bg);
  color: var(--skill-color);
  font-family: var(--font-mono);
  font-size: var(--skill-font);
  font-weight: 500;
  line-height: normal;
  white-space: nowrap;
  cursor: var(--cursor-pointer);
  box-shadow:
    0 6px 10px rgba(11, 36, 71, 0.14),
    var(--skill-inset);
  transition:
    background-color 0.18s ease-in-out,
    border-color 0.18s ease-in-out,
    color 0.18s ease-in-out,
    box-shadow 0.18s ease-in-out;
}
.wu-skills__item.is-off {
  --skill-bg: #d9dee3;
  --skill-border: #d9dee3;
  --skill-color: #99a1a8;

  box-shadow:
    0 0 0 transparent,
    var(--skill-inset);
}
.wu-skills__item--static {
  justify-content: center;
  cursor: var(--cursor-default);
}
.wu-skills__name {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
}
.wu-skills__icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  object-fit: contain;
  transition: opacity 0.18s ease-in-out;
}
.is-off .wu-skills__icon {
  opacity: 0.35;
}
.wu-skills__label {
  overflow: hidden;
  text-overflow: ellipsis;
}
.wu-skills__toggle {
  width: 21px;
  height: 13.9px;
  flex-shrink: 0;
  margin: -0.9px -1px -2px;
}

.wu-skills__track { fill: #3fc64b; transition: fill 0.18s ease-in-out; }
.wu-skills__thumb {
  transform: translateX(7.5px);
  transition: transform 0.18s ease-in-out;
  filter: drop-shadow(0 1px 1px rgb(0 0 0 / 0.2));
}
.is-off .wu-skills__track { fill: #bfc7cc; }
.is-off .wu-skills__thumb { transform: translateX(0); }

.wu-skills::after {
  content: '';
  position: absolute;
  left: -16px;
  right: -16px;
  bottom: 0;
  height: 16px;
  backdrop-filter: blur(2px);
  pointer-events: none;
  z-index: 1;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0),
    rgba(255, 255, 255, 0.3)
  );
}

@media (width < 1024px) {
  .wu-skills {
    --skill-gap: 8px;
    --skill-font: 8px;
    --skill-pad: 6px;

    margin-top: 16px;
  }
  .wu-skills__list {
    width: 232px;
  }
  .wu-skills__list { gap: 7px; padding-bottom: 6px; }
  .wu-skills__item {
    height: 25px;
    flex: var(--flex-m);
  }
  .wu-skills::after {
    left: -12px;
    right: -12px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .wu-skills__track, .wu-skills__thumb { transition: none; }
}
</style>
