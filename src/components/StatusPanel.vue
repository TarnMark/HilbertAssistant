<template>
    <aside class="status">
        <div class="card">
            <div class="title">Validation</div>
            <div class="progress-bar">
                <div class="fill" :style="{ width: (store.goalAchieved ? 100 : 0) + '%' }"></div>
            </div>
            <!--<div class="percent">{{ store.progress }}%</div> -->
        </div>

        <div class="goal">
            <h3 class="goal-label">Goal</h3>
            <div class="goal-formula">{{ formulaToString(store.goal) }}</div>
            <b v-if="store.goalAchieved">Goal achieved!</b>
        </div>
    </aside>
</template>

<script setup lang="ts">
import { formulaToString } from '@/logic';
import { useProofStore } from '../stores/proofStore'
const store = useProofStore()
</script>

<style scoped>
.status {
    background: #f8fafc;
    padding: 1.5rem;
    overflow-y: auto;
}

.card {
    background: white;
    padding: 1rem;
    border: 1px solid #e2e8f0;
    margin-bottom: 2rem;
}

.progress-bar {
    height: 6px;
    background: #e2e8f0;
    margin: 0.5rem 0;
}

.fill {
    height: 100%;
    background: #16a34a;
}

/* .goal-label {
    font-size: 0.75rem;
    text-transform: uppercase;
    opacity: 0.6;
} */

.goal-formula {
    font-family: monospace;
}
</style>