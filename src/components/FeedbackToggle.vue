<template>
  <label class="feedback-toggle">
    <span class="toggle-label">
      {{ t(label) }}
    </span>

    <button class="toggle-track" :class="{ active: modelValue }" @click="toggle" type="button">
      <span class="toggle-thumb" />
    </button>
  </label>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  modelValue: boolean,
  label: string
}>()

const { t } = useI18n()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

function toggle() {
  emit('update:modelValue', !props.modelValue)
}
</script>

<style scoped>
.feedback-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;

  user-select: none;
}

.toggle-label {
  font-size: 0.78rem;
  font-weight: 500;

  color: #6b7280;
}

.toggle-track {
  position: relative;

  width: 34px;
  height: 18px;

  border: none;
  border-radius: 999px;

  background: #d1d5db;

  cursor: pointer;

  transition:
    background 0.18s ease;
}

.toggle-track.active {
  background: #1b66d8;
}

.toggle-thumb {
  position: absolute;

  top: 2px;
  left: 2px;

  width: 14px;
  height: 14px;

  border-radius: 50%;

  background: white;

  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.15);

  transition:
    transform 0.18s ease;
}

.toggle-track.active .toggle-thumb {
  transform: translateX(16px);
}

.toggle-track:hover {
  filter: brightness(0.97);
}

.toggle-track.active:hover {
  background: #103772;
}
</style>