<template>
    <aside class="status-panel">

        <section class="goal-section">
            <div class="section-label">{{ t('main.titles.goal') }}</div>

            <div class="goal-formula">
                {{ formulaToString(store.goal) }}
            </div>

            <div v-if="store.status.kind === 'goal'" class="goal-success">
                {{ t('feedback.hints.achieved') }}
            </div>
        </section>

        <div class="card" v-if="store.giveFeedback">
            <div class="title">{{ t('main.titles.progress') }}</div>
            <div class="progress-bar">
                <div class="fill" :style="{ width: progressWidth }"
                    :class="{ loading: store.status.kind === 'analyzing' }"></div>
            </div>
        </div>


        <!-- FEEDBACK -->
        <section class="feedback-section">

            <div class="section-label">{{ t('main.titles.feedback') }}</div>

            <div v-if="store.status.kind === 'analyzing'" class="feedback-loading">
                <span class="spinner"></span>
                <span>{{ statusMessage }}</span>
            </div>

            <div v-else-if="statusMessage" class="feedback-message">
                {{ statusMessage }}
            </div>
            <!-- -if="store.status.kind === 'idle'" -->
            <div v-else class="feedback-placeholder">
                {{ t('feedback.hints.idle') }}
            </div>


            <div v-if="store.status.error" class="feedback-errors">
                <div class="section-label error-label">{{ t('main.titles.error') }}</div>

                <div class="error-message ">
                    {{ errorMessage }}
                </div>
            </div>

        </section>


    </aside>
</template>

<script setup lang="ts">
import { formulaToString } from '@/logic';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useProofStore } from '@/stores/proofStore';
const store = useProofStore()
const { t } = useI18n()

const progressWidth = computed(() => {
    if (store.goalAchieved) return "100%"

    if (!store.feedback && store.status.kind !== 'analyzing') return "0%"

    return `${store.progress * 100}%`
})

const statusMessage = computed(() => {
    if (store.status.message) {
        return store.status.params
            ? t(store.status.message, store.status.params)
            : t(store.status.message)
    }
    return null
})

const errorMessage = computed(() => {
    if (store.status.error) {
        return store.status.error.data ? t(store.status.error.message, store.status.error.data) : t(store.status.error.message)
    }
    return null
})
</script>

<style scoped>
.status {
    background: #f8fafc;
    padding: 1.5rem;
    overflow-y: auto;
    gap: 20px
}

.status-panel {
    background: #f8fafc;
    display: flex;
    flex-direction: column;
    gap: 20px;

    padding: 12px;
}

.card {
    background: white;
    padding: 1rem;
    border: 1px solid #e2e8f0;
    /* margin-bottom: 2rem; */
}

.progress-bar {
    height: 6px;
    background: #e2e8f0;
    margin: 0.5rem 0;
}

.fill {
    height: 100%;
    background: #16a34a;
    transition: width 0.3s ease;
    border-radius: 4px;
}

.status-text {
    margin-top: 6px;
    font-size: 12px;
    color: #6b7280;
}

.fill.loading {
    animation: pulse 1s infinite;
}

@keyframes pulse {
    0% {
        opacity: 0.4
    }

    50% {
        opacity: 1
    }

    100% {
        opacity: 0.4
    }
}


/* SECTION LABELS */

.section-label {
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.10em;

    color: #6b7280;

    margin-bottom: 6px;
}

section {
    margin-left: 0.5rem;
    margin-top: 0.5rem;
}


/* GOAL */

.goal-section {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.goal-formula {
    font-family: monospace;
    font-weight: 600;
    font-size: 16px;

    color: #111827;
}

.goal-success {
    font-size: 12px;
    font-weight: 600;

    color: #065f46;
}


/* FEEDBACK */

.feedback-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.feedback-message {
    font-size: 13px;
    color: #374151;
}

.feedback-placeholder {
    font-size: 12px;
    color: #9ca3af;
    font-style: italic;
}


/* LOADING */

.feedback-loading {
    display: flex;
    align-items: center;
    gap: 8px;

    font-size: 12px;
    color: #6b7280;
}

.spinner {
    width: 12px;
    height: 12px;

    border: 2px solid #dbe3f2;
    border-top: 2px solid #1b66d8;

    border-radius: 50%;

    animation: spin 0.8s linear infinite;
}


/* ERRORS */

.feedback-errors {
    margin-top: 6px;

    padding-top: 6px;

    border-top: 1px solid #f1f5f9;
}

.error-label {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;

    color: #ed2626;

    margin-bottom: 4px;
}

.error-message {
    font-size: 12px;
    color: #e43030;
}


/* ANIMATION */

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>