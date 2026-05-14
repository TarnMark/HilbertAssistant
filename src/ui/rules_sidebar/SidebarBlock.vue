<template>
    <div class="formula-section">
        <div class="section-header">
            <h3 class="section-title">{{ title }}</h3>

            <button class="add-btn" @click="onCreating">
                +
            </button>
        </div>

        <div class="formula-list">
            <NewJustificationCard v-if="creating" :allowName="have_names" :allowPremises="have_premises"
                @cancel="creating = false; store.resetStatus('');" @create="createFormula" />

            <div v-for="formula in formulas" :key="formula.name" class="formula-card"
                @click="$emit('select-justification', formula.name)">
                <div class="formula-name">{{ formula.name }}</div>

                <div class="formula-desc">
                    {{ visualFormula(formula) }}
                </div>

                <button @click.stop="onDelete(formula)" class="delete-btn">
                    ✕
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { formulaToString } from '@/logic';
import { AppError } from '@/logic/proof/AppError';
import type { VisualJustification } from '@/logic/proof/Justification';
import { useProofStore } from '@/stores/proofStore';
import { ref } from 'vue';
import NewJustificationCard from './NewJustificationCard.vue';
const props = defineProps<{ title: string, formulas: VisualJustification[], have_names?: boolean, have_premises?: boolean }>()

const store = useProofStore()

const creating = ref(false)
defineEmits(["select-justification"])

function onCreating() {
    creating.value = true

    let just: string
    if (!props.have_names) just = 'assumption'
    else if (!props.have_premises) just = 'axiom'
    else just = 'rule'

    store.setStatus({ kind: 'hint', message: 'feedback.hints.newjust.' + just })
}

function onDelete(formula: VisualJustification) {
    try {
        store.removeJustification(formula)

        const name = formula.name
        store.setStatus({ kind: 'idle', message: 'feedback.hints.newjust.deleted', params: { name } })
    }
    catch (error) {
        if (error instanceof AppError) {
            store.setStatus({ kind: 'error', error })
        }
        else store.setStatus({ kind: 'error', error: new AppError((error as Error).message) })
    }
}

function createFormula(justification: VisualJustification) {
    if (!props.have_names) justification.name = 'H' + (props.formulas.length + 1)
    try { store.addJustification(justification) }
    catch (error) {
        store.setStatus({ kind: 'error', error: (error as AppError) })
        return
    }
    creating.value = false

    const name = justification.name
    store.setStatus({ kind: 'idle', message: 'feedback.hints.newjust.created', params: { name } })
}

function visualFormula(formula: VisualJustification): string {
    if (formula.category === 'rule')
        return formula.inputs?.map((f) => formulaToString(f)).join(', ') + (formula.inputs?.length ? ' ⊢ ' : '') + formula.formula
    return formula.formula
}
</script>

<style scoped>
.formula-section {
    margin-bottom: 1.5rem;
}

.section-title {
    font-size: 0.75rem;
    font-weight: 700;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    margin-bottom: 1rem;

    display: flex;
    align-items: center;
    justify-content: space-between;
}

.section-header {
    display: flex;
    align-items: center;
}

.add-btn {
    margin-left: auto;

    width: 22px;
    height: 22px;

    background: none;
    border: none;

    font-size: 1.2rem;
    color: #d4d4d4;

    cursor: pointer;

    transition: opacity 0.15s ease, color 0.15s ease;
}

.add-btn:hover {
    color: #2563eb;
}

.formula-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

/* card styling */
.formula-card {
    position: relative;

    padding: 0.75rem;

    border: 1px solid #f5f5f5;
    border-radius: 0.5rem;

    background: #fafafa;

    /* cursor: pointer; */

    transition: all 0.15s ease;
}

/* .formula-card:hover {
    border-color: #e5e5e5;
    background: #f8f8f8;
} */
.formula-card:hover {
    background: #f4f7ff;
    border-color: #1b66d8;
    cursor: pointer;
}

/* formula name */
.formula-name {
    font-size: 0.75rem;
    font-weight: 700;
    color: #2563eb;

    margin-bottom: 0.25rem;
}

/* formula text */
.formula-desc {
    font-size: 0.9rem;
    font-family: monospace;
    font-style: italic;
}

/* delete button */
.delete-btn {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;

    border: none;
    background: none;

    font-size: 0.85rem;
    color: #d4d4d4;

    cursor: pointer;
    /* 
    opacity: 0; */

    transition: opacity 0.15s ease, color 0.15s ease;
}

/* .formula-card:hover .delete-btn {
    opacity: 1;
} */

/* hover color */
.delete-btn:hover {
    color: #ef4444;
}
</style>