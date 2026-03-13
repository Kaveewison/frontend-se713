<script setup lang="ts">
import { ref, computed } from 'vue';
import type { CommonInputProps } from './types';
import { MASK_PATTERNS } from './types';

const props = withDefaults(defineProps<CommonInputProps>(), {
  type: 'text',
  placeholder: '',
  disabled: false,
  readonly: false,
  autocomplete: 'off',
  error: false,
  errorMessage: '',
  success: false,
  touched: false,
  required: false,
  showCharCount: false,
  loading: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null];
  'blur': [event?: FocusEvent | Event];
  'focus': [event: FocusEvent];
  'input': [event: InputEvent];
}>();

const showPassword = ref(false);

const inputType = computed(() => {
  if (props.type === 'password' && showPassword.value) {
    return 'text';
  }
  return props.type;
});

const displayValue = computed(() => {
  if (props.mask && props.modelValue) {
    return applyMask(String(props.modelValue));
  }
  return props.modelValue ?? '';
});

const characterCount = computed(() => {
  const value = String(props.modelValue || '');
  return value.length;
});

const isError = computed(() => {
  return props.touched && !!props.error;
});

const displayErrorMessage = computed(() => {
  if (typeof props.error === 'string' && props.error) return props.error;
  return props.errorMessage;
});

const shouldShowCharCount = computed(() => {
  return props.showCharCount || (props.maxlength !== undefined && props.maxlength > 0);
});

const hasIconSlot = computed(() => {
  return false;
});

const inputClasses = computed(() => {
  return {
    'base-input__field': true,
    'base-input__field--error': isError.value,
    'base-input__field--success': props.success,
    'base-input__field--disabled': props.disabled,
    'base-input__field--with-icon': props.icon || hasIconSlot.value,
    'base-input__field--with-suffix': props.type === 'password' || props.loading,
  };
});

const applyMask = (value: string): string => {
  if (!props.mask) return value;

  const maskConfig = MASK_PATTERNS[props.mask];
  if (maskConfig && maskConfig.transform) {
    return maskConfig.transform(value);
  }

  return value;
};

const removeMask = (value: string): string => {
  if (!props.mask) return value;

  if (props.mask === 'citizenId' || props.mask === 'phone') {
    return value.replace(/\D/g, '');
  }

  return value;
};

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  let value: string | number | null = target.value;

  if (props.mask) {
    value = removeMask(value as string);
  }

  if (value === '') {
    value = null;
  } else if (props.type === 'number' && value !== null) {
    value = Number(value);
  }

  emit('update:modelValue', value);
  emit('input', event as InputEvent);
};

const handleBlur = (event: FocusEvent | Event) => {
  emit('blur', event);
};

const handleFocus = (event: FocusEvent) => {
  emit('focus', event);
};

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};
</script>

<template>
  <div class="base-input">
    <label v-if="label" :for="id" class="base-input__label">
        {{ label }}
        <span v-if="required" class="required">*</span>
    </label>

    <div class="base-input__wrapper">
      <div v-if="icon || $slots.icon" class="base-input__icon">
        <slot name="icon">
          <component v-if="typeof icon === 'object' || typeof icon === 'function'" :is="icon" class="icon-component" :size="17" :stroke-width="2" />
          <span v-else class="base-input__icon-placeholder">{{ icon }}</span>
        </slot>
      </div>

      <input :type="inputType" :value="displayValue" :placeholder="placeholder" :disabled="disabled"
        :readonly="readonly" :autocomplete="autocomplete" :maxlength="maxlength" :min="min" :max="max" :step="step"
        :aria-label="ariaLabel" :aria-describedby="ariaDescribedby"
        :aria-invalid="isError ? 'true' : undefined" :id="id" :class="inputClasses" @input="handleInput"
        @blur="handleBlur" @focus="handleFocus" data-testid="base-input-field" />

      <div v-if="type === 'password' || loading || $slots.suffix" class="base-input__suffix">
        <slot name="suffix">
          <div v-if="loading" class="base-input__spinner" data-testid="base-input-spinner">
            <svg class="base-input__spinner-icon" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="60"
                stroke-dashoffset="30" stroke-linecap="round" />
            </svg>
          </div>

          <button v-else-if="type === 'password'" type="button" class="base-input__toggle-password"
            :aria-label="showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'" @click="togglePasswordVisibility"
            data-testid="base-input-password-toggle">
            <svg v-if="showPassword" class="base-input__toggle-icon" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2">
              <path
                d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
            <svg v-else class="base-input__toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </slot>
      </div>
    </div>

    <div class="input-meta">
      <div v-if="isError && displayErrorMessage" class="base-input__error" :id="ariaDescribedby"
        data-testid="base-input-error">
        <svg class="base-input__error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span>{{ displayErrorMessage }}</span>
      </div>
      <div v-else></div>

      <div v-if="shouldShowCharCount && maxlength" class="char-count" :class="{ 'char-count-full': characterCount === maxlength }">
        {{ characterCount }} / {{ maxlength }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.base-input {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  width: 100%;
  flex: 1;
  min-width: 0;
}

.base-input__label {
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.required {
  color: var(--error);
  font-weight: 600;
}

.base-input__wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.base-input__field {
  width: 100%;
  padding: 0.72rem 1rem;
  font-size: 0.88rem;
  font-family: var(--font-family);
  color: var(--text-main);
  background-color: var(--bg-input);
  border: 1.5px solid var(--border-input);
  border-radius: var(--radius-md);
  outline: none;
  transition: all var(--transition-fast);
}

.base-input__field--with-icon {
  padding-left: 2.6rem;
}

.base-input__field--with-suffix {
  padding-right: 2.75rem;
}

.base-input__field::placeholder {
  color: #b8bcc4;
}

.base-input__field:hover:not(:disabled):not(:focus) {
  border-color: #aeb4c0;
}

.base-input__field:focus {
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3.5px var(--primary-glow);
}

.base-input__field--error {
  border-color: var(--border-error) !important;
  background-color: var(--error-bg) !important;
}

.base-input__field--error:focus {
  box-shadow: 0 0 0 3.5px rgba(239, 68, 68, 0.15) !important;
}

.base-input__field--success {
  border-color: var(--success);
}

.base-input__field--success:focus {
  box-shadow: 0 0 0 3px var(--success-bg);
}

.base-input__field--disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #f9f9f9;
}

.base-input__icon {
  position: absolute;
  left: 0.85rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  pointer-events: none;
  transition: color var(--transition-fast);
  z-index: 1;
}

.base-input__field:focus~.base-input__icon,
.base-input__field:focus+.base-input__icon,
.base-input__wrapper:focus-within .base-input__icon {
  color: var(--primary);
}

.base-input__icon-placeholder {
  font-size: 0.75rem;
  text-transform: uppercase;
}

.icon-component {
  width: 17px;
  height: 17px;
}

.base-input__suffix {
  position: absolute;
  right: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.base-input__toggle-password {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  transition: color var(--transition-fast);
  min-width: 44px;
  min-height: 44px;
}

.base-input__toggle-password:hover {
  color: var(--primary);
}

.base-input__toggle-password:focus {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

.base-input__toggle-icon {
  width: 18px;
  height: 18px;
}

.base-input__spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
}

.base-input__spinner-icon {
  width: 18px;
  height: 18px;
  animation: spin 0.7s linear infinite;
}

.input-meta {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  min-height: 1.2rem;
}

.char-count {
  font-size: 0.72rem;
  color: var(--text-muted);
  margin-left: auto;
  transition: color var(--transition-fast);
}

.char-count-full {
  color: var(--success);
  font-weight: 600;
}

.base-input__error {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.76rem;
  color: var(--error);
  animation: slideUp 0.2s ease-out forwards;
}

.base-input__error-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
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
