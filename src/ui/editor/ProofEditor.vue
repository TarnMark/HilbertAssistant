<template>
    <section class="editor">
        <div class="toolbar">
            <button @click="startStep" :disabled="creating || store.goalAchieved" class="btn btn-primary">
                <span class="icon">+</span>
                {{ t('main.buttons.add_step') }}
            </button>
            <button @click="undoStep" :disabled="creating || store.steps.length == 0" class="btn btn-secondary">
                <span class="icon">↶</span>
                {{ t('main.buttons.undo_step') }}</button>
        </div>

        <div class="canvas">
            <ProofStepRow v-for="step in store.steps" :key="step.index" :step="step" @click="addStepInput(step)"
                :class="{ selected: draftStep.inputs.includes(step) }" />

            <NewStepBlock v-if="creating" :step-number="store.steps.length + 1" @cancel="onCancel"
                @committed="onCommitted" :draftStep="draftStep" />
        </div>
    </section>
</template>

<script setup lang="ts">
import type { ProofStep } from '@/logic'
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useProofStore } from '@/stores/proofStore'
import NewStepBlock from './NewStepBlock.vue'
import ProofStepRow from './ProofStepRow.vue'

const store = useProofStore()
const { t } = useI18n()

const creating = ref(false)

const draftStep = reactive({
    justification: null as string | null,
    inputs: [] as (ProofStep | null)[],
    formula: ""
})

function startStep() {
    creating.value = true

    resetStepCreation
    store.setStatus({ kind: 'hint', message: 'feedback.hints.newstep.creating' })
}
function startWithData(justification: string) {
    creating.value = true

    resetStepCreation
    draftStep.justification = justification

    const just = store.availableJustifications.find(j => j.name === justification)
    store.setStatus({ kind: 'hint', message: 'feedback.hints.newstep.' + (just?.category ?? 'creating') })
}

function addStepInput(step: ProofStep) {

    if (!creating.value) return
    if (!draftStep.justification) return

    const rule = store.availableJustifications.find(j => j.name === draftStep.justification)

    const required = rule?.inputs?.length ?? 0

    if (required === 0 || rule?.category !== 'rule') return

    const i = draftStep.inputs.lastIndexOf(step) // step being added in inputs
    const n = draftStep.inputs.findIndex(i => i === null) // existing null spots

    if (n !== -1) { // null/empty spots available
        draftStep.inputs[n] = step
        return
    }

    if (draftStep.inputs.length >= required) { // all slots filled - adding existing removes last occurrence
        if (i !== -1) draftStep.inputs[i] = null
        return
    }
    draftStep.inputs.push(step)
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

async function onCommitted() {
    resetStepCreation(true)
    await new Promise(resolve => setTimeout(resolve))
    await store.analyzeStep()
}

function onCancel() {
    resetStepCreation(true)
    store.resetStatus('')
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

    max-height: 84vh;
}

.canvas {
    flex: 1;
    overflow-y: scroll;
    padding: 12px;
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