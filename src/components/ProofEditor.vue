<template>
    <section class="editor">
        <div class="toolbar">
            <button @click="startStep" :disabled="creating || store.goalAchieved" class="btn btn-primary">
                <span class="icon">+</span>
                Add Step
            </button>
            <button @click="undoStep" :disabled="creating || store.steps.length == 0" class="btn btn-secondary">
                <span class="icon">↶</span>
                Undo Step</button>
        </div>

        <div class="canvas">
            <ProofStepRow v-for="step in store.steps" :key="step.index" :step="step" @click="addStepInput(step.index)"
                :class="{ selected: draftStep.inputs.includes(step.index) }" />

            <NewStepBlock v-if="creating" :step-number="store.steps.length + 1" @cancel="resetStepCreation(true)"
                @committed="resetStepCreation(true)" :draftStep="draftStep" />
        </div>
    </section>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useProofStore } from '../stores/proofStore'
import ProofStepRow from './ProofStepRow.vue'
import NewStepBlock from './NewStepBlock.vue'

const store = useProofStore()
const creating = ref(false)


const draftStep = reactive({
    justification: null as string | null,
    inputs: [] as (number | null)[],
    formula: ""
})

function startStep() {
    creating.value = true

    resetStepCreation
}
function startWithData(justification: string) {
    creating.value = true

    resetStepCreation
    draftStep.justification = justification
}

function addStepInput(index: number) {

    if (!creating.value) return
    if (!draftStep.justification) return

    const rule = store.availableJustifications.find(j => j.name === draftStep.justification)

    const required = rule?.inputs?.length ?? 0

    if (required === 0) return

    const i = draftStep.inputs.indexOf(index)

    if (i !== -1) {
        // draftStep.inputs.splice(i, 1)
        draftStep.inputs[i] = null
        return
    }

    const n = draftStep.inputs.findIndex(i => i === null)
    if (n !== -1) {
        draftStep.inputs[n] = index
        return
    }

    if (draftStep.inputs.length >= required) return
    draftStep.inputs.push(index)
}

function undoStep() {
    store.undoStep()
}

function resetStepCreation(close?: boolean) {
    draftStep.justification = null
    draftStep.inputs = []
    draftStep.formula = ""

    if (close) creating.value = false
}

defineExpose({
    startWithData
})
</script>

<style scoped>
/* toolbar container */

.toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;

    margin-bottom: 0.75rem;
}

.editor {
    display: flex;
    flex-direction: column;

    height: 100%;
}

.canvas {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
    scrollbar-gutter: stable;
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