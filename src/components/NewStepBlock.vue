<template>
    <div class="creation-block">

        <div class="header">
            <div class="title">
                <span class="badge">{{ stepNumber }}</span>
                New Step
            </div>
        </div>

        <div class="fields">

            <div class="field">
                <label>Justification</label>
                <select v-model="selected">
                    <option v-for="j in store.availableJustifications" :key="j.name" :value="j.name">
                        {{ j.name }}
                    </option>
                </select>
            </div>

            <div v-if="requiresInputs" class="field">
                <label>Input Steps</label>
                <div class="inputs">
                    <label v-for="step in store.steps" :key="step.index" class="input-option">
                        <input type="checkbox" :value="step.index" v-model="inputs" />
                        ({{ step.index }})
                    </label>
                </div>
            </div>

            <div class="field">
                <label>Formula</label>
                <input class="formula-input" v-model="formula" placeholder="A → (B → A)" />
            </div>

        </div>

        <div class="actions">
            <span class="error" v-if="error">{{ error }}</span>

            <button class="btn-primary" @click="commit">
                Commit Step
            </button>

            <button class="btn-secondary" @click="$emit('cancel')">
                Cancel
            </button>
        </div>

    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useProofStore } from '../stores/proofStore'
import { toJust, type VisualJustification } from '@/helpers';

defineProps<{ stepNumber: number }>()
const emit = defineEmits(['committed', 'cancel'])

const store = useProofStore()

const selected = ref('')
const formula = ref('')
const inputs = ref<number[]>([])
const error = ref<string | null>(null)

const requiresInputs = computed(() => {
    const j = selectedJustification()
    return j?.inputs
})

function selectedJustification(): VisualJustification | undefined {
    return store.availableJustifications.find(j => j.name === selected.value);
}


function commit() {
    const selected = selectedJustification()
    if (!selected) {
        error.value = 'No justification selectd'
    }
    const just = toJust(selected!, inputs.value)
    // console.log('Committing step: ' + formula.value + '\n' + JSON.stringify(just))
    const result = store.commitStep(
        formula.value,
        just,
    )

    if (!result.success) {
        error.value = result.error ?? 'Invalid step.'
        return
    }

    emit('committed')
}
</script>

<style scoped>
.creation-block {
    background: #fafafa;

    border: 1px solid #e0e7ff;

    border-radius: 0.75rem;

    padding: 1.25rem;

    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}

/*///////////////////////////////////////////////////////////////// */
/* replace grid with vertical layout */

.fields {
    display: flex;
    flex-direction: column;

    gap: 0.9rem;

    margin-bottom: 0.5rem;
}

.field {
    display: flex;
    flex-direction: column;

    gap: 0.35rem;
}


/* standard form controls */

select,
.formula-input {
    /* width: 100%; */

    padding: 0.5rem 0.75rem;

    border-radius: 0.5rem;

    border: 1px solid #e5e5e5;

    background: white;

    font-size: 0.9rem;

    outline: none;

    transition: border-color 0.15s, box-shadow 0.15s;
}


/* formula specific styling */

.formula-input {
    font-family: monospace;
}


/* focus state matching other inputs */

select:focus,
.formula-input:focus {
    border-color: #4f46e5;

    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.15);
}

/*///////////////////////////////////////////////////////////////// */

/* header */

.header {
    display: flex;
    align-items: center;

    margin-bottom: 1rem;
}

.title {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    font-size: 0.9rem;
    font-weight: 700;

    color: #1b66d8;
}

.badge {
    width: 24px;
    height: 24px;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 0.35rem;

    background: #1b66d8;
    color: white;

    font-size: 0.65rem;
    font-weight: 600;
}

/* labels */

label {
    font-size: 0.65rem;

    font-weight: 700;

    color: #a3a3a3;

    letter-spacing: 0.05em;

    text-transform: uppercase;
}


/* inputs */

select,
input[type="text"],
input[type="checkbox"] {
    font-size: 0.9rem;
}


/* input steps container */

.inputs {
    display: flex;
    flex-wrap: wrap;

    gap: 0.4rem;

    padding: 0.35rem;

    border: 1px solid #e5e5e5;

    border-radius: 0.5rem;

    background: white;

    min-height: 38px;
}

.input-option {
    font-size: 0.7rem;

    padding: 0.15rem 0.45rem;

    border-radius: 0.35rem;

    background: #f5f5f5;

    border: 1px solid #e5e5e5;

    display: flex;
    align-items: center;
    gap: 0.25rem;

    cursor: pointer;
}


/* actions */

.actions {
    display: flex;
    align-items: center;

    justify-content: flex-end;

    gap: 0.5rem;

    padding-top: 0.5rem;
}


/* buttons */

.btn-primary {
    padding: 0.45rem 0.9rem;

    border-radius: 0.5rem;

    background: #1b66d8;
    color: white;

    font-size: 0.75rem;
    font-weight: 700;

    border: none;

    cursor: pointer;

    transition: background 0.15s;
}

.btn-primary:hover {
    background: #103772;
}

.btn-secondary {
    padding: 0.45rem 0.9rem;

    border-radius: 0.5rem;

    background: #f5f5f5;

    font-size: 0.75rem;
    font-weight: 600;

    border: 1px solid #e5e5e5;

    cursor: pointer;
}

.btn-secondary:hover {
    background: #eeeeee;
}


/* error text */

.error {
    margin-right: auto;

    font-size: 0.75rem;

    color: #dc2626;

    font-weight: 500;
}
</style>