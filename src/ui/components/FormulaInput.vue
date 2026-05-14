<template>
    <div class="formula-field">

        <input class="formula-input" ref="inputEl" :autofocus="true" :value="modelValue" @input="formatFormulaInput"
            :placeholder="placeholder ?? t('main.components.input.placeholder')" />

        <HintTooltip class="formula-hint">
            <div>{{ t('main.components.input.hint_title') }}</div>
            <div>• {{ t('main.components.input.hint_imp') }}</div>
            <div>• {{ t('main.components.input.hint_neg') }}</div>
            <div>• {{ t('main.components.input.hint_paren') }}</div>
        </HintTooltip>

    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import HintTooltip from './HintTooltip.vue';


const { t } = useI18n()

defineProps<{
    modelValue: string,
    placeholder?: string
}>()

const emit = defineEmits<{
    (e: "update:modelValue", value: string): void
}>()

function formatFormulaInput(event: Event) {
    const input = event.target as HTMLInputElement

    let value = input.value

    value = value.toUpperCase()
    value = value.replace(/[^A-Z()>→\-¬\w]/g, "")

    input.value = value
    emit("update:modelValue", value)
}

</script>

<style scoped>
.formula-field {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
}

.formula-input {
    width: 100%;
    display: flex;
    /* width: auto; */

    padding: 0.5rem 2rem 0.5rem 0.75rem;

    border-radius: 0.5rem;
    border: 1.5px solid #e5e5e5a8;
    outline: none;

    background: white;
    transition: border-color 0.15s, box-shadow 0.15s;

    /* font-size: 0.9rem; */
    font-family: monospace;
    /* text-transform: uppercase; */
}

.formula-input:focus {
    border: 1.5px solid #4e46e5aa;

    /* box-shadow: 0 0 0 2px rgba(34, 30, 126, 0.233); */
}

.formula-input::placeholder {
    color: #9aa1ad;
    opacity: 1;
}

.formula-input:focus::placeholder {
    opacity: 0;
}

.formula-hint {
    position: absolute;
    right: 0.5rem;

    display: flex;
    align-items: center;
    justify-content: center;
}
</style>