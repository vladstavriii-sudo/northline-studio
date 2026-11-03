<template>
  <DefaultLayout v-if="doc" bar-only-footer>
    <article class="legal">
      <div class="legal__inner">
        <header class="legal__head">
          <h1 class="legal__title">{{ doc.title }}</h1>
          <p class="legal__meta">{{ doc.meta }}</p>

          <button type="button" class="legal__print" @click="print">
            <span class="legal__print-label">Print</span>
            <span class="legal__print-icon">
              <img :src="printIcon" alt="" />
            </span>
          </button>
        </header>

        <nav class="legal__toc" aria-labelledby="legal-toc-title">
          <p id="legal-toc-title" class="legal__toc-title">Contents</p>
          <ol class="legal__toc-list">
            <li v-for="section in doc.sections" :key="section.id">
              <a :href="`#${section.id}`" @click="jump($event, section.id)">
                {{ section.title }}
              </a>
            </li>
            <li>
              <a href="#contact" @click="jump($event, 'contact')">
                {{ doc.contact.title }}
              </a>
            </li>
          </ol>
        </nav>

        <div class="legal__intro">
          <LegalBlocks :blocks="doc.intro" />
        </div>

        <section
          v-for="(section, i) in doc.sections"
          :id="section.id"
          :key="section.id"
          class="legal__section"
        >
          <h2 class="legal__heading">{{ i + 1 }}. {{ section.title }}</h2>
          <LegalBlocks :blocks="section.blocks" />
        </section>

        <section id="contact" class="legal__section legal__section--contact">
          <h2 class="legal__heading legal__heading--plain">
            {{ doc.contact.title }}
          </h2>
          <LegalBlocks :blocks="doc.contact.blocks" />
        </section>

        <p class="legal__footnote">{{ doc.footnote }}</p>
      </div>
    </article>
  </DefaultLayout>

  <NotFoundPage v-else />
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import NotFoundPage from '@/pages/NotFoundPage.vue';
import LegalBlocks from '@/components/legal/LegalBlocks.vue';
import { findLegalDoc } from '@/content/legal/legal.data.js';
import { anchorTop, scrollToY } from '@/utils/scroll';
import printIcon from '@/assets/icons/print.svg';

const route = useRoute();
const doc = computed(() => findLegalDoc(String(route.name)));

const print = () => window.print();

function jump(event, id) {
  const target = document.getElementById(id);
  if (!target) return;

  event.preventDefault();
  scrollToY(anchorTop(target));
}
</script>

<style scoped>
.legal {
  background: var(--white);
  color: var(--black-900);
}

.legal__inner {
  display: flex;
  flex-direction: column;
  gap: 32px;
  max-width: var(--container-width);
  margin-inline: auto;
  padding: calc(var(--header-height) + 110px) var(--container-padding) 64px;
}

.legal__inner > * {
  max-width: 1160px;
}

.legal__head {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
}

.legal__title {
  margin: 0;
  font-family: var(--font-mono);
  font-size: clamp(34px, 4vw, 56px);
  font-weight: 600;
  line-height: 1;
}

.legal__meta {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 500;
  line-height: 1.6;
}

.legal__print {
  display: inline-flex;
  align-items: center;
  gap: 26px;
  padding: 10px 10px 10px 16px;
  border: 1px solid var(--black);
  border-radius: 8px;
  background: var(--blue-100);
  box-shadow: var(--shadow-blue);
  color: var(--white);
  cursor: var(--cursor-pointer);
  transition: filter 0.3s var(--transition-timing);
}

.legal__print:hover {
  filter: brightness(1.06);
}

.legal__print:focus-visible {
  outline: 2px solid var(--black);
  outline-offset: 3px;
}

.legal__print-label {
  font-family: var(--font-mono);
  font-size: 16px;
  font-weight: 600;
  line-height: normal;
}

.legal__print-icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  background: var(--black);
}

.legal__print-icon img {
  width: 26px;
  height: 26px;
}

.legal__toc {
  padding: 35px;
  border: 3px dashed var(--blue-100);
  border-radius: 8px;
}

.legal__toc-title {
  margin: 0 0 10px;
  color: rgba(0, 0, 0, 0.7);
  font-family: var(--font-mono);
  font-size: 18px;
  font-weight: 500;
  text-transform: uppercase;
}

.legal__toc-list {
  list-style: decimal;
  margin: 0;
  padding-left: 30px;
  font-family: var(--font-mono);
  font-size: clamp(15px, 1.4vw, 20px);
  line-height: 1.6;
}

.legal__toc-list a {
  color: inherit;
  text-decoration: none;
}

.legal__toc-list a:hover,
.legal__toc-list a:focus-visible {
  text-decoration: underline;
  text-underline-offset: 3px;
}

.legal__section {
  scroll-margin-top: calc(var(--header-height) + 60px);
}

.legal__heading {
  margin: 0 0 16px;
  font-family: var(--font-mono);
  font-size: clamp(20px, 2vw, 24px);
  font-weight: 500;
  line-height: 1.3;
}

.legal__section--contact {
  padding: 35px;
  border: 3px dashed var(--blue-100);
  border-radius: 8px;
}
.legal__section--contact .legal__heading {
  margin: 0 0 10px;
  color: rgba(0, 0, 0, 0.7);
  font-size: 18px;
  text-transform: uppercase;
}
.legal__footnote {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 18px;
  font-weight: 500;
}

.legal__intro,
.legal__section {
  font-family: var(--font-mono);
  font-size: clamp(15px, 1.3vw, 18px);
  line-height: 1.6;
}

@media (width < 1024px) {
  .legal__inner {
    gap: 24px;
    padding: calc(var(--header-height) + 48px) var(--container-padding-mobile)
      48px;
  }

  .legal__toc {
    padding: 20px;
  }

  .legal__toc-list {
    padding-left: 20px;
  }
}

@media print {
  .legal__inner {
    padding: 0;
  }

  .legal__print {
    display: none;
  }

  .legal__section {
    break-inside: avoid;
  }
}
</style>
