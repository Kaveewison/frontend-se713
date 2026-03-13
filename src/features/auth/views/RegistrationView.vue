<script setup lang="ts">
import RegistrationForm from '../components/RegistrationForm.vue';
import RegistrationHero from '../components/RegistrationHero.vue';
</script>

<template>
  <div class="registration-layout animate-fade-in">
    <!-- Left Panel: Form -->
    <div class="form-panel-wrapper">
      <RegistrationForm />
    </div>

    <!-- Right Panel: Decoration/Hero -->
    <div class="hero-panel-wrapper">
      <RegistrationHero />
    </div>
  </div>
</template>

<style scoped>
.registration-layout {
  display: flex;
  min-height: 100vh;
  width: 100%;
}

.form-panel-wrapper {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--bg-page);
  padding: 2rem;
  position: relative;
}

/* Subtle decorative gradient on form side */
.form-panel-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 120px;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(89, 71, 236, 0.02));
  pointer-events: none;
}

.hero-panel-wrapper {
  flex: 1;
  display: flex;
  position: relative;
  overflow: hidden;
}

/* Responsive layout: stack columns on smaller screens */
@media (max-width: 1024px) {
  .registration-layout {
    flex-direction: column;
  }

  .hero-panel-wrapper {
    display: none;
    /* simple hide for mobile, focus on form */
  }

  .form-panel-wrapper {
    padding: 1.5rem;
  }
}
</style>
