<script setup lang="ts">
import { computed } from 'vue';
import type { BaseButtonProps, BaseButtonEmits } from './types';

const props = withDefaults(defineProps<BaseButtonProps>(), {
  variant: 'primary',
  size: 'medium',
  disabled: false,
  loading: false,
  fullWidth: false,
  iconOnly: false,
  iconPosition: 'left',
  type: 'button'
});

const emit = defineEmits<BaseButtonEmits>();

const buttonClasses = computed(() => [
  'base-button',
  `base-button--${props.variant}`,
  `base-button--${props.size}`,
  {
    'base-button--full-width': props.fullWidth,
    'base-button--icon-only': props.iconOnly,
    'base-button--loading': props.loading,
    'base-button--disabled': props.disabled
  }
]);

const spinnerSize = computed(() => {
  const sizes = {
    small: 16,
    medium: 18,
    large: 20
  };
  return sizes[props.size];
});

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event);
  }
};

const displayText = computed(() => {
  if (props.loading && props.loadingText) {
    return props.loadingText;
  }
  return null;
});
</script>

<template>
  <button :type="type" :class="buttonClasses" :disabled="disabled || loading" :aria-label="ariaLabel"
    :aria-busy="loading ? 'true' : undefined" data-testid="base-button" @click="handleClick">
    <!-- Loading spinner -->
    <span v-if="loading" class="base-button__spinner" :style="{ width: `${spinnerSize}px`, height: `${spinnerSize}px` }"
      data-testid="base-button-spinner" aria-hidden="true" />

    <!-- Icon (left position) -->
    <span v-if="icon && iconPosition === 'left' && !loading" class="base-button__icon base-button__icon--left"
      data-testid="base-button-icon-left">
      <slot name="icon">
        <!-- Icon slot for custom icons -->
      </slot>
    </span>

    <!-- Button text content -->
    <span v-if="!iconOnly" class="base-button__text" data-testid="base-button-text">
      {{ displayText }}
      <slot v-if="!displayText" />
    </span>

    <!-- Icon (right position) -->
    <span v-if="icon && iconPosition === 'right' && !loading" class="base-button__icon base-button__icon--right"
      data-testid="base-button-icon-right">
      <slot name="icon">
        <!-- Icon slot for custom icons -->
      </slot>
    </span>
  </button>
</template>

<style scoped>
.base-button {
  /* Base styles */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: none;
  border-radius: var(--radius-md, 0.5rem);
  font-family: inherit;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast, 0.15s) ease;
  position: relative;
  white-space: nowrap;
  user-select: none;
  min-height: 44px;
  /* Minimum touch target size */
}

/* Size variants */
.base-button--small {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  min-height: 36px;
}

.base-button--medium {
  padding: 0.78rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 600;
}

.base-button--large {
  padding: 0.88rem 2rem;
  font-size: 1rem;
  font-weight: 600;
}

/* Primary variant */
.base-button--primary {
  background: linear-gradient(135deg, var(--primary, #5947ec), #7c6cf0);
  color: white;
  font-weight: 600;
}

.base-button--primary:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--primary-hover, #4a3bc7), #6b5ce0);
  box-shadow: 0 4px 16px rgba(89, 71, 236, 0.35);
  transform: translateY(-1px);
}

.base-button--primary:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(89, 71, 236, 0.25);
}

/* Secondary variant */
.base-button--secondary {
  background: #f1f2f6;
  color: var(--text-secondary);
  font-weight: 500;
}

.base-button--secondary:hover:not(:disabled) {
  background: #e2e8f0;
  transform: translateY(-1px);
}

.base-button--secondary:active:not(:disabled) {
  transform: translateY(0);
}

/* Outline variant */
.base-button--outline {
  background: transparent;
  color: var(--primary, #5947ec);
  border: 1.5px solid var(--primary, #5947ec);
}

.base-button--outline:hover:not(:disabled) {
  background: var(--primary-light, #f0edff);
  transform: translateY(-1px);
}

.base-button--outline:active:not(:disabled) {
  transform: translateY(0);
}

/* Ghost variant */
.base-button--ghost {
  background: transparent;
  color: var(--text-main, #1a1a1a);
}

.base-button--ghost:hover:not(:disabled) {
  background: var(--bg-secondary, #f5f5f5);
  color: var(--primary, #5947ec);
}

.base-button--ghost:active:not(:disabled) {
  background: var(--bg-tertiary, #e8e8e8);
}

/* Full width */
.base-button--full-width {
  width: 100%;
}

/* Icon only */
.base-button--icon-only {
  padding: 0.75rem;
  min-width: 44px;
}

.base-button--icon-only.base-button--small {
  padding: 0.5rem;
  min-width: 36px;
}

.base-button--icon-only.base-button--large {
  padding: 1rem;
  min-width: 48px;
}

/* Disabled state */
.base-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

/* Loading state */
.base-button--loading {
  cursor: wait;
}

/* Spinner */
.base-button__spinner {
  display: inline-block;
  border: 2px solid transparent;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.base-button--primary .base-button__spinner {
  border-top-color: white;
  border-right-color: white;
}

.base-button--secondary .base-button__spinner,
.base-button--outline .base-button__spinner,
.base-button--ghost .base-button__spinner {
  border-top-color: var(--primary, #5947ec);
  border-right-color: var(--primary, #5947ec);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Icon */
.base-button__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.base-button--small .base-button__icon {
  font-size: 16px;
}

.base-button--medium .base-button__icon {
  font-size: 18px;
}

.base-button--large .base-button__icon {
  font-size: 20px;
}

/* Text */
.base-button__text {
  display: inline-flex;
  align-items: center;
}

/* Focus visible for keyboard navigation */
.base-button:focus-visible {
  outline: 2px solid var(--primary, #5947ec);
  outline-offset: 2px;
}
</style>
