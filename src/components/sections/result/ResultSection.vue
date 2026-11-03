<template>
  <section id="result" class="result">
    <div class="container">
      <div class="result__wrapper">
        <div class="result__header">
          <h2 class="result__title">
            Good work. <br />
            Better results.
          </h2>
          <h3 class="result__subtitle">
            A look at the projects, partnerships and client relationships we’ve
            built along the way.
          </h3>
        </div>
        <div ref="stats" class="result__stats">
          <AppCard as="article" class="result__stat result__stat--projects">
            <AppCard class="result__stat-wrapper">
              <video
                ref="cardVideo"
                class="result__stat-video"
                :src="cardBgVideo"
                aria-hidden="true"
                muted
                loop
                playsinline
                preload="none"
              ></video>
              <span class="result__stat-label">project delivered</span>
              <div class="result__stat-content">
                <span class="result__stat-highlight">250+</span>
                <p class="result__stat-text">
                  Website & digital products launched for global clients.
                </p>
              </div>
            </AppCard>
          </AppCard>
          <AppCard as="article" class="result__stat result__stat--clients">
            <AppCard class="result__stat-wrapper">
              <span class="result__stat-label">CLIENT SUCCESS</span>
              <span class="result__stat-highlight">98%</span>
              <div class="result__stat-clients">
                <p class="result__stat-text">Client satisfaction rate</p>
                <ul class="result__stat-clients-list">
                  <li>
                    <img
                      src="@/assets/images/result/avatar-1.webp"
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                  </li>
                  <li>
                    <img
                      src="@/assets/images/result/avatar-2.webp"
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                  </li>
                  <li>
                    <img
                      src="@/assets/images/result/avatar-3.webp"
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                  </li>
                  <li>
                    <img
                      src="@/assets/images/result/avatar-4.webp"
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                  </li>
                </ul>
              </div>
              <p class="result__stat-text">
                "Northline Studio understood our vision completely and delivered
                a site and campaign that exceeded expectations."
              </p>
              <span class="result__stat-label"
                >— Marketing Director, Fintech Co.</span
              >
            </AppCard>
          </AppCard>
          <AppCard as="article" class="result__stat result__stat--campaign">
            <AppCard class="result__stat-wrapper">
              <span class="result__stat-label">CAMPAIGN PERFORMANCE</span>
              <div>
                <span class="result__stat-highlight">3.2X</span>
                <p class="result__stat-text">
                  Average ROAS across paid ad campaigns
                </p>
              </div>
              <span class="result__stat-description">
                Data from 200+ campaigns managed in the last 12 months.
              </span>
            </AppCard>
          </AppCard>
          <AppCard as="article" class="result__stat result__stat--cta">
            <AppCard class="result__stat-wrapper">
              <button
                type="button"
                class="result__stat-link"
                @click="openContactModal"
              >
                <span class="result__stat-link-title"
                  >Have a project in mind?</span
                >
                <span class="result__stat-link-action">contact us</span>
              </button>
            </AppCard>
          </AppCard>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useTemplateRef } from 'vue';
import { useMagneticEffect } from '@/composables/useMagneticEffect';
import { useVideoAutoplay } from '@/composables/useVideoAutoplay';
import { useContactModal } from '@/composables/useContactModal';
import AppCard from '@/components/ui/AppCard.vue';
import cardBgVideo from '@/assets/images/result/card-bg.mp4';

const statsRef = useTemplateRef('stats');
const cardVideoRef = useTemplateRef('cardVideo');

const { open: openContactModal } = useContactModal();

useMagneticEffect(() => statsRef.value?.children ?? []);

useVideoAutoplay(() => cardVideoRef.value, { threshold: 0.15 });
</script>

<style scoped>
.result {
  padding-block: 150px;
}

.result__header {
  display: flex;
  max-width: 800px;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-inline: auto;
  text-align: center;
  margin-bottom: 84px;
}
.result__title {
  color: var(--blue-100);
}
.result__subtitle {
  max-width: 700px;
}

.result__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: 370px 170px;
  gap: 30px;
  translate: -6px;
}

.result__stat {
  --card-radius: 16px;
  --card-border-width: 3px;
  --card-pad: 0;

  will-change: transform;
}

.result__stat-wrapper {
  --card-bg: var(--wrapper-bg);
  --card-pad: 20px;

  position: relative;
  top: 16px;
  left: 16px;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.result__stat--projects {
  --card-bg: var(--blue-100);
  --wrapper-bg: url('@/assets/images/result/card-bg.webp');
  min-height: 570px;
  grid-row: span 2 / span 2;
}

.result__stat--projects .result__stat-wrapper {
  position: relative;
  justify-content: space-between;
  overflow: hidden;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.result__stat--projects .result__stat-video {
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}

.result__stat--projects .result__stat-wrapper::before {
  content: '';
  position: absolute;
  inset: 0 0 auto 0;
  z-index: 1;
  height: 30%;
  background: linear-gradient(rgba(0, 0, 0, 0.45), transparent);
  pointer-events: none;
}

.result__stat--projects .result__stat-label,
.result__stat--projects .result__stat-content {
  position: relative;
  z-index: 2;
}

.result__stat--projects .result__stat-label {
  color: var(--white);
}

.result__stat--projects .result__stat-content {
  display: flex;
  padding: 5px 20px 16px 20px;
  flex-direction: column;
  gap: 8px;
  align-self: stretch;
  border-radius: 16px;
  background: var(--white);
}

.result__stat--projects .result__stat-highlight {
  color: var(--blue-100);
}
.result__stat--clients {
  --card-bg: var(--lime-400);
  --wrapper-bg: var(--gray-200);
  grid-row: span 2 / span 2;
}

.result__stat--clients .result__stat-highlight {
  margin-block: 8px;
}

.result__stat--clients .result__stat-clients {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: auto;
}

.result__stat--clients .result__stat-clients .result__stat-text {
  margin-bottom: 0;
}

.result__stat--clients .result__stat-text {
  margin-bottom: 20px;
}
.result__stat--campaign {
  --card-bg: var(--pink-300);
  --wrapper-bg: var(--lime-400);
  max-height: 360px;
}

.result__stat--campaign .result__stat-wrapper {
  justify-content: space-between;
}

.result__stat--campaign .result__stat-label {
  color: var(--gray-300);
}

.result__stat--campaign .result__stat-highlight {
  display: inline-block;
  margin-bottom: 8px;
}

.result__stat--campaign .result__stat-description {
  color: var(--gray-400);
  font-family: var(--font-mono);
  font-size: 16px;
  line-height: normal;
}
.result__stat--cta {
  --card-bg: var(--black);
  --wrapper-bg: var(--blue-100);
  max-height: 170px;
  grid-column-start: 3;
  transition: all 0.3s var(--transition-timing);
}

.result__stat--cta .result__stat-wrapper {
  top: 12px;
  left: 12px;
  justify-content: center;
  transition: all 0.3s var(--transition-timing);
}

.result__stat--cta:hover {
  --card-radius: 100px;
}

.result__stat--cta:hover .result__stat-wrapper {
  --card-radius: 100px;
  background-image: repeating-linear-gradient(
    240deg,
    var(--blue-300) 0 26px,
    var(--blue-100) 26px 52px
  );
  background-size: 57px 100%;
  animation: stripes-slide 1.6s linear infinite;
}

@keyframes stripes-slide {
  from {
    background-position: 0 0;
  }
  to {
    background-position: 57.4px 0;
  }
}

.result__stat-label {
  color: var(--gray-500);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
}
.result__stat-highlight {
  font-size: clamp(72px, 6vw, 110px);
  line-height: 1;
}
.result__stat-text {
  font-family: var(--font-mono);
  font-size: clamp(14px, 2vw, 22px);
  font-weight: 500;
  line-height: 1.3;
}
.result__stat-clients-list {
  display: flex;
}

.result__stat-clients-list li:not(:first-child) {
  margin-left: -10px;
}
.result__stat-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  color: var(--white);
  text-align: center;
  font-size: clamp(44px, 6vw, 66px);
  font-weight: 500;
  line-height: 1;
}

.result__stat-link-title {
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 400;
  line-height: normal;
}

.result__stat-link-action {
  text-transform: uppercase;
}
@media (width >= 1440px) and (height >= 720px) {
  .result {
    display: flex;
    flex-direction: column;
    min-height: calc(100svh - var(--anchor-offset));
    padding-block: clamp(24px, 3svh, 56px);
  }

  .result .container {
    display: flex;
    flex: 1;
    flex-direction: column;
    container-type: inline-size;
  }

  .result__wrapper {
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: center;
  }

  .result__header {
    margin-bottom: clamp(24px, 4svh, 84px);
  }

  .result__title {
    font-size: min(var(--heading-h2), 7svh);
  }

  .result__stats {
    grid-template-rows: 1fr auto;
    flex: 1 1 0;
    gap: min(30px, 3svh);
    min-height: min-content;
    max-height: calc(100cqw * 0.413);
  }

  .result__stat--projects,
  .result__stat--campaign,
  .result__stat--cta {
    min-height: 0;
    max-height: none;
  }

  .result__stat--cta {
    min-height: min(calc(100cqw * 0.125), 18svh);
  }

  .result__stat-highlight {
    font-size: min(clamp(72px, 6vw, 110px), 9svh);
  }

  .result__stat-text {
    font-size: max(14px, min(22px, 1.5vw, 2.4svh));
  }

  .result__stat-clients-list img {
    width: min(74px, 7svh);
    height: auto;
  }

  .result__stat-link {
    font-size: clamp(44px, 4.8cqw, 66px);
  }
}

@media (width < 1440px) {
  .result__stats {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: auto;
  }
  .result__stat--projects {
    grid-row: span 3 / span 3;
  }
  .result__stat--clients {
    grid-row: span 2 / span 2;
  }
  .result__stat--campaign {
    max-height: 100%;
    grid-row: span 2 / span 2;
  }
  .result__stat--cta {
    max-height: 100%;
    grid-column-start: 1;
    grid-row-start: 4;
  }
}

@media (width < 1024px) {
  .result {
    padding-block: 100px;
  }
  .result__stats {
    grid-template-columns: 1fr;
  }

  .result__stat-wrapper {
    --card-pad: 12px;

    top: 10px;
    left: 10px;
  }

  .result__stat--projects {
    max-height: 436px;
    min-height: 436px;
    grid-row: auto;
  }

  .result__stat--projects .result__stat-content {
    padding: 5px 12px 12px 12px;
  }
  .result__stat--clients {
    min-height: 436px;
    grid-row: auto;
  }
  .result__stat--campaign {
    min-height: 260px;
    grid-row: auto;
  }
  .result__stat--cta {
    min-height: 130px;
    grid-row-start: auto;
  }

  .result__stat--cta .result__stat-wrapper {
    --card-pad: 20px;

    top: 10px;
    left: 10px;
  }

  .result__stat-clients-list img {
    width: 60px;
    height: 60px;
  }
}

@media (width < 768px) {
  .result__title { font-size: clamp(32px, 9vw, 40px); font-weight: 600; }
}
</style>
