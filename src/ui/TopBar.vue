<template>
    <div class="top-bar">
        <h2>HilbertAssistant</h2>

        <div class="options">
            <FeedbackToggle v-model="store.giveFeedback" label="main.buttons.toggle_feedback" />
            <LanguageSwitcher />
            <button class="btn-primary" @click="$emit('reset')">{{ t('main.buttons.new_proof') }}</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import LanguageSwitcher from './components/LanguageSwitcher.vue';
import FeedbackToggle from './components/FeedbackToggle.vue';
import { useProofStore } from '@/stores/proofStore';

const store = useProofStore()
const { t } = useI18n()

defineEmits(['reset'])

</script>

<style scoped>
.top-bar {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    /* justify-content: right; */
    padding-left: 2rem;
    padding-right: 2rem;
    border-bottom: 1px solid rgba(33, 34, 63, 0.221);
    margin-bottom: 1rem;
}

.options {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1rem;
}

.btn-primary {
    align-self: center;

    height: fit-content;
    padding: 0.45rem 0.9rem;
    border-radius: 0.5rem;
    border: none;

    font-size: 0.8rem;
    font-weight: 700;

    background: #1b66d8;
    color: white;
    transition: background 0.15s;

    cursor: pointer;
}

.btn-primary:hover {
    background: #103772;
}
</style>