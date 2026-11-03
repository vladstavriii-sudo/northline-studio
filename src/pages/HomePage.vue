<template>
  <DefaultLayout>
    <HeroSection />
    <BrandSection />
    <ResultSection />
    <ServicesSection />
    <ArchiveSection />
    <ProcessSection />
    <TeamSection />
    <WhyUsSection />
    <CtaSection />
  </DefaultLayout>
</template>

<script setup>
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import HeroSection from '@/components/sections/hero/HeroSection.vue';
import BrandSection from '@/components/sections/brand/BrandSection.vue';
import ResultSection from '@/components/sections/result/ResultSection.vue';
import ServicesSection from '@/components/sections/services/ServicesSection.vue';
import ArchiveSection from '@/components/sections/archive/ArchiveSection.vue';
import ProcessSection from '@/components/sections/process/ProcessSection.vue';
import TeamSection from '@/components/sections/team/TeamSection.vue';
import WhyUsSection from '@/components/sections/why-us/WhyUsSection.vue';
import CtaSection from '@/components/sections/cta/CtaSection.vue';
</script>
