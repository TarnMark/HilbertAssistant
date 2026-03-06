<template>
    <div class="proof-step">
        <div class="gutter">
            {{ step.index + 1 }}
        </div>

        <div class="content">
            <div class="formula">
                {{ formulaToString(step.formula) }}
            </div>

            <div class="justification">
                {{ formatJustification(step.justification) }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { formatJustification, formulaToString, type ProofStep } from '@/logic';
defineProps<{ step: ProofStep }>()
</script>

<style scoped>
.proof-step {
    display: flex;
    align-items: stretch;

    border-bottom: 1px solid #f5f5f5;

    transition: background-color 0.15s ease;
}

.proof-step:hover {
    background-color: #fafafa;
}

/* gutter column (like code editor line numbers) */
.gutter {
    width: 48px;
    flex-shrink: 0;

    display: flex;
    align-items: center;
    justify-content: center;

    font-size: 0.85rem;
    font-weight: 500;

    color: #a3a3a3;

    border-right: 1px solid #f0f0f0;

    background: #fafafa;
}

/* main content */
.content {
    flex: 1;

    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: 0.75rem 1rem;
}

/* formula styling */
.formula {
    font-family: monospace;
    font-size: 0.95rem;

    color: #262626;
}

/* justification styling */
.justification {
    font-size: 0.75rem;
    color: #737373;

    margin-left: 1rem;
    white-space: nowrap;
}
</style>