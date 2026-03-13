<script setup lang="ts">
interface Props {
    modelValue: boolean;
    disabled?: boolean;
}

interface Emits {
    (e: 'update:modelValue', value: boolean): void;
}

const props = withDefaults(defineProps<Props>(), {
    disabled: false,
});

const emit = defineEmits<Emits>();

const toggle = () => {
    if (!props.disabled) {
        emit('update:modelValue', !props.modelValue);
    }
};
</script>

<template>
    <button type="button" role="switch" :aria-checked="modelValue" :disabled="disabled"
        :class="['toggle', { 'toggle-active': modelValue, 'toggle-disabled': disabled }]" @click="toggle">
        <span :class="['toggle-thumb', { 'toggle-thumb-active': modelValue }]" />
    </button>
</template>

<style scoped>
.toggle {
    position: relative;
    display: inline-flex;
    align-items: center;
    width: 44px;
    height: 24px;
    background-color: #e5e7eb;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: background-color 0.2s ease;
    padding: 0;
}

.toggle:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
}

.toggle-active {
    background-color: var(--primary);
}

.toggle-disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.toggle-thumb {
    position: absolute;
    left: 2px;
    width: 20px;
    height: 20px;
    background-color: white;
    border-radius: 50%;
    transition: transform 0.2s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.toggle-thumb-active {
    transform: translateX(20px);
}
</style>
