<script setup lang="ts">
import type { BaseFormGroupProps } from './types';

const props = withDefaults(defineProps<BaseFormGroupProps>(), {
  layout: 'vertical',
  required: false,
  error: false
});
</script>

<template>
  <div class="form-group" :class="[
    `form-group--${layout}`,
    { 'has-error': error }
  ]">
    <!-- Label -->
    <label v-if="label || $slots.label" :for="props.for" class="form-label">
      <slot name="label">
        {{ label }}
        <span v-if="required" class="required">*</span>
      </slot>
    </label>

    <!-- Input slot -->
    <div class="form-input">
      <slot />
    </div>

    <!-- Hint text -->
    <span v-if="hint || $slots.hint" class="hint-text">
      <slot name="hint">
        {{ hint }}
      </slot>
    </span>

    <!-- Error message -->
    <span v-if="error && errorMessage" class="error-text">
      {{ errorMessage }}
    </span>
  </div>
</template>

<style scoped>
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-group--vertical {
  flex-direction: column;
}

.form-group--horizontal {
  flex-direction: row;
  align-items: flex-start;
  gap: 1rem;
}

.form-group--horizontal .form-label {
  width: 30%;
  padding-top: 0.88rem;
  flex-shrink: 0;
}

.form-group--horizontal .form-input {
  width: 70%;
  flex-grow: 1;
}

.form-label {
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--text-secondary);
  display: block;
}

.required {
  color: var(--error, #dc2626);
  margin-left: 0.15rem;
}

.form-input {
  width: 100%;
}

.hint-text {
  font-size: 0.76rem;
  color: var(--text-muted, #6b7280);
  display: block;
}

.error-text {
  font-size: 0.76rem;
  color: var(--error, #dc2626);
  display: block;
  animation: slideUp 0.2s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Error state styling */
.has-error .form-label {
  color: var(--error, #dc2626);
}
</style>
