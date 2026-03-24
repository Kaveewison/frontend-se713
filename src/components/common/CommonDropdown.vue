<script setup lang="ts">
import { computed } from 'vue';
import type { Component } from 'vue';

export interface DropdownOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

interface Props {
  modelValue?: string | number | null;
  label?: string;
  placeholder?: string;
  id?: string;
  required?: boolean;
  error?: string;
  touched?: boolean;
  disabled?: boolean;
  icon?: Component;
  options: DropdownOption[];
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'เลือก...',
  required: false,
  touched: false,
  disabled: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number];
  change: [value: string | number];
  blur: [];
}>();

const hasError = computed(() => props.touched && !!props.error);

const selectValue = computed(() =>
  props.modelValue == null || props.modelValue === '' ? '' : props.modelValue,
);

const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  const value = target.value;
  emit('update:modelValue', value);
  emit('change', value);
};

const handleBlur = () => {
  emit('blur');
};
</script>

<template>
  <div class="form-group" :class="{ 'has-error': hasError }">
    <label v-if="label" :for="id">
      {{ label }}
      <span v-if="required" class="required">*</span>
    </label>

    <div
      class="custom-select"
      :class="{ 'select-error': hasError, 'has-icon': !!icon }"
    >
      <component
        v-if="icon"
        :is="icon"
        class="select-icon-left"
        :size="17"
        :stroke-width="2"
      />

      <select
        :id="id"
        :value="selectValue"
        :disabled="disabled"
        :required="required"
        @change="handleChange"
        @blur="handleBlur"
      >
        <option value="" disabled selected>{{ placeholder }}</option>
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
          :disabled="option.disabled"
        >
          {{ option.label }}
        </option>
      </select>

      <svg
        class="select-chevron"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <polyline points="6,9 12,15 18,9" />
      </svg>
    </div>

    <transition name="error-msg">
      <span v-if="hasError" class="error-text">{{ error }}</span>
    </transition>
  </div>
</template>

<style scoped>
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  flex: 1;
  min-width: 0;
}

label {
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.required {
  color: var(--error);
  font-weight: 600;
}

/* Custom Select */
.custom-select {
  position: relative;
}

.select-icon-left {
  position: absolute;
  left: 0.85rem;
  top: 50%;
  transform: translateY(-50%);
  width: 17px;
  height: 17px;
  color: var(--text-muted);
  pointer-events: none;
  z-index: 1;
  transition: color var(--transition-fast);
}

.custom-select:focus-within .select-icon-left {
  color: var(--primary);
}

.custom-select select {
  width: 100%;
  padding: 0.72rem 1rem;
  padding-right: 2.5rem;
  font-family: var(--font-family);
  font-size: 0.88rem;
  color: var(--text-main);
  background-color: var(--bg-input);
  border: 1.5px solid var(--border-input);
  border-radius: var(--radius-md);
  outline: none;
  transition: all var(--transition-fast);
  appearance: none;
  cursor: pointer;
}

.custom-select.has-icon select {
  padding-left: 2.6rem;
}

/* Placeholder styling - when no value selected */
.custom-select select:invalid {
  color: #b8bcc4;
}

.custom-select select option {
  color: var(--text-main);
}

.custom-select select option[value=''][disabled] {
  display: none;
}

.custom-select select:hover {
  border-color: #aeb4c0;
}

.custom-select select:focus {
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3.5px var(--primary-glow);
}

.select-chevron {
  position: absolute;
  right: 0.85rem;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: var(--text-muted);
  pointer-events: none;
  transition: transform var(--transition-fast);
}

.custom-select:focus-within .select-chevron {
  transform: translateY(-50%) rotate(180deg);
  color: var(--primary);
}

/* Error State */
.select-error select {
  border-color: var(--border-error) !important;
  background-color: var(--error-bg) !important;
}

.select-error select:focus {
  box-shadow: 0 0 0 3.5px rgba(239, 68, 68, 0.15) !important;
}

/* Disabled State */
.custom-select select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #f9fafb;
  border-color: #e5e7eb;
}

/* Error Text */
.error-text {
  font-size: 0.76rem;
  color: var(--error);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.error-text::before {
  content: '⚠';
  font-size: 0.7rem;
}

.error-msg-enter-active {
  animation: slideUp 0.25s ease-out forwards;
}

.error-msg-leave-active {
  animation: fadeOut 0.15s ease-in forwards;
}

@keyframes fadeOut {
  to {
    opacity: 0;
    transform: translateY(-4px);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(4px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
