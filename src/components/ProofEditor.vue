<template>
    <section class="editor">
        <div class="toolbar">
            <!-- <span> -->
            <button @click="openCreator" :disabled="creating || store.goalAchieved" class="btn btn-primary">
                <span class="icon">+</span>
                Add Step
            </button>
            <button @click="undoStep" :disabled="creating || store.steps.length == 0" class="btn btn-secondary">
                <span class="icon">↶</span>
                Undo Step</button>
            <!-- </span> -->
        </div>

        <div class="canvas">
            <ProofStepRow v-for="step in store.steps" :key="step.index" :step="step" />

            <StepCreationBlock v-if="creating" :step-number="store.steps.length + 1" @cancel="creating = false"
                @committed="creating = false" />
        </div>
    </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useProofStore } from '../stores/proofStore'
import ProofStepRow from './ProofStepRow.vue'
import StepCreationBlock from './NewStepBlock.vue'

const store = useProofStore()
const creating = ref(false)

function openCreator() {
    creating.value = true
}

function undoStep() {
    store.undoStep()
}
</script>

<style scoped>
/* toolbar container */

.toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;

    margin-bottom: 0.75rem;
}

/* base button */

.btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;

    padding: 0.5rem 1rem;
    margin: 0rem 1rem;

    font-size: 0.9rem;
    font-weight: 600;

    border-radius: 0.5rem;
    border: none;

    cursor: pointer;

    transition:
        background-color 0.15s ease,
        box-shadow 0.15s ease,
        transform 0.05s ease;
}

/* icon styling */

.icon {
    font-size: 1rem;
    line-height: 1;
}

/* primary (Add Step) */

.btn-primary {
    background-color: #1b66d8;
    color: white;

    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}

.btn-primary:hover:not(:disabled) {
    background-color: #103772;
}

/* secondary (Undo Step) */

.btn-secondary {
    background-color: #f5f5f5;
    color: #404040;

    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.btn-secondary:hover:not(:disabled) {
    background-color: #e5e5e5;
}

/* disabled state */

.btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    box-shadow: none;
}
</style>