<script setup lang="ts">
import { computed } from 'vue';
import { X } from 'lucide-vue-next';

interface Props {
  modelValue: boolean;
  title: string;
  size?: 'small' | 'medium' | 'large';
  showFooter?: boolean;
  confirmText?: string;
  cancelText?: string;
  confirmDisabled?: boolean;
  confirmLoading?: boolean;
  showCancel?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  showFooter: true,
  confirmText: 'บันทึก',
  cancelText: 'ยกเลิก',
  confirmDisabled: false,
  confirmLoading: false,
  showCancel: true,
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  confirm: [];
  cancel: [];
}>();

const modalSizeClass = computed(() => {
  const sizes = {
    small: 'modal-small',
    medium: 'modal-medium',
    large: 'modal-large',
  };
  return sizes[props.size];
});

const close = () => {
  emit('update:modelValue', false);
  emit('cancel');
};

const confirm = () => {
  emit('confirm');
};
</script>

<template>
  <Teleport to="body" class="">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click.self="close">
        <div class="modal-content" :class="modalSizeClass">
          <div class="modal-header">
            <h3>{{ title }}</h3>
            <button class="close-btn" @click="close" type="button">
              <X />
            </button>
          </div>

          <div class="modal-body">
            <slot />
          </div>

          <div v-if="showFooter" class="modal-footer">
            <slot name="footer">
              <!-- <button
                v-if="showCancel"
                class="btn btn-cancel"
                @click="close"
                :disabled="confirmLoading"
              >
                {{ cancelText }}
              </button> -->
              <button
                class="btn btn-primary"
                @click="confirm"
                :disabled="confirmDisabled || confirmLoading"
              >
                {{ confirmLoading ? 'กำลังดำเนินการ...' : confirmText }}
              </button>
            </slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: var(--radius-lg);
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-small {
  max-width: 450px;
}

.modal-medium {
  max-width: 600px;
}

.modal-large {
  max-width: 800px;
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    max-height: 85vh;
  }
}

@media (max-width: 480px) {
  .modal-content {
    width: 100%;
    max-width: 100%;
    border-radius: var(--radius-md);
  }
}

.modal-header {
  padding-top: 56px;
  padding-left: 98px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@media (max-width: 480px) {
  .modal-header {
    padding: 1.25rem 1rem;
  }
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-main);
  margin: 0;
}

@media (max-width: 480px) {
  .modal-header h3 {
    font-size: 1.1rem;
  }
}

.close-btn {
  margin-right: 28px;
  position: relative;
  top: -20px;
}

.close-btn:hover {
  background-color: #f3f4f6;
  color: var(--text-main);
}

.close-btn svg {
  width: 20px;
  height: 20px;
}

.modal-body {
  margin: 48px 98px 48px 98px;
}

@media (max-width: 480px) {
  .modal-body {
    padding: 1.25rem 1rem;
  }
}

.modal-footer {
  margin: 48px 98px 48px 98px;

  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

@media (max-width: 480px) {
  .modal-footer {
    padding: 1rem;
    flex-direction: column-reverse;
  }

  .modal-footer .btn {
    width: 100%;
  }
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}

@media (max-width: 480px) {
  .btn {
    padding: 10px 16px;
    font-size: 0.85rem;
  }
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: var(--primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--primary-hover);
}

.btn-cancel {
  background-color: #e5e7eb;
  color: var(--text-secondary);
}

.btn-cancel:hover:not(:disabled) {
  background-color: #d1d5db;
}

/* Transition animations */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.95);
}
</style>
