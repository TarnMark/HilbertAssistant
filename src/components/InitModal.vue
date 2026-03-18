<template>
    <div class="overlay">
        <div class="modal">
            <h2 class="title">Start New Proof Construction</h2>

            <div class="section">
                <label class="section-label">Choose ruleset</label>
                <RulesetToggle v-model="selectedRuleset" left-label="Hilbert" right-label="Extended"
                    left-value="hilbert" right-value="extended" />
            </div>

            <div class="section">
                <label class="section-label">Assumptions</label>

                <div v-for="(assumption, index) in assumptions" :key="index" class="assumption-row">
                    <FormulaInput v-model="assumptions[index]!" />
                    <!-- <input v-model="assumptions[index]" class="text-input" placeholder="Enter assumption" /> -->

                    <button class="remove-btn" @click="removeAssumption(index)">
                        ×
                    </button>
                </div>

                <button class="btn-secondary add-btn" @click="addAssumption">
                    Add Assumption
                </button>
            </div>

            <div class="section">
                <label class="section-label">Goal (required)</label>
                <FormulaInput v-model="goal" />
                <!-- <input v-model="goal" class="text-input" placeholder="Enter goal formula" /> -->
            </div>

            <div class="actions">
                <button class="btn-primary" @click="submit">
                    Start Proof
                </button>
                <span class="error" v-if="error">
                    {{ error }}
                </span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useProofStore } from '@/stores/proofStore'
import FormulaInput from './FormulaInput.vue'
import RulesetToggle from './RulesetToggle.vue'

const store = useProofStore()

const selectedRuleset = ref("hilbert")
const assumptions = ref<string[]>([])
const goal = ref('')
const error = ref<string | null>(null)


function addAssumption() {
    assumptions.value.push('')
}

function removeAssumption(index: number) {
    assumptions.value.splice(index, 1)
}

function submit() {
    if (!goal.value.trim()) {
        error.value = 'Goal is required.'
        return
    }

    const result = store.initializeSession(
        selectedRuleset.value === 'extended',
        assumptions.value,
        goal.value
    )

    if (!result.success) {
        error.value = result.error ?? 'Initialization failed.'
        return
    }
}
</script>

<style scoped>
/* overlay */

.overlay {
    position: fixed;
    inset: 0;

    background: rgba(0, 0, 0, 0.35);

    display: flex;
    align-items: center;
    justify-content: center;

    z-index: 1000;
}


/* modal */

.modal {
    width: 460px;

    background: #fafafa;

    border: 1px solid #e5e5e5;

    border-radius: 0.75rem;

    padding: 1.5rem;

    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
}


/* title */

.title {
    font-size: 2rem;
    font-weight: 700;

    color: #1b66d8;

    margin-bottom: 1.25rem;
    margin-top: 0.5rem;
}


/* sections */

.section {
    display: flex;
    flex-direction: column;

    gap: 0.6rem;

    margin-bottom: 1.1rem;
}


/* labels */

.section-label {
    font-size: 0.65rem;
    font-weight: 700;

    color: #a3a3a3;

    text-transform: uppercase;
    letter-spacing: 0.05em;
}


/* input rows */

.assumption-row {
    display: flex;
    align-items: center;

    gap: 0.5rem;
}

.assumption-row>input {
    width: 100%;
}

/* text inputs */

/* .text-input {
    flex: 1;

    padding: 0.5rem 0.75rem;

    border-radius: 0.5rem;

    border: 1px solid #e5e5e5;

    font-size: 0.9rem;

    background: white;

    outline: none;

    transition: border-color 0.15s, box-shadow 0.15s;
}

.text-input:focus {
    border-color: #1b66d8;

    box-shadow: 0 0 0 2px rgba(27, 102, 216, 0.15);
} */


/* remove assumption button */

.remove-btn {
    border: none;

    background: transparent;

    font-size: 1rem;

    color: #c4c4c4;

    cursor: pointer;

    padding: 0.2rem 0.4rem;

    transition: color 0.15s;
}

.remove-btn:hover {
    color: #dc2626;
}


/* actions */

.actions {
    display: flex;
    align-items: center;

    justify-content: space-between;

    margin-top: 0.5rem;
}


/* error text */

.error {
    font-size: 0.75rem;

    color: #dc2626;
}


/* buttons */

.btn-primary {
    padding: 0.45rem 0.9rem;

    border-radius: 0.5rem;

    border: none;

    font-size: 0.8rem;
    font-weight: 700;

    background: #1b66d8;
    color: white;

    cursor: pointer;

    transition: background 0.15s;
}

.btn-primary:hover {
    background: #103772;
}


/* secondary button */

.btn-secondary {
    padding: 0.4rem 0.8rem;

    border-radius: 0.5rem;

    border: 1px solid #e5e5e5;

    background: #f5f5f5;

    font-size: 0.75rem;
    font-weight: 500;

    cursor: pointer;

    transition: background 0.15s;
}

.btn-secondary:hover {
    background: #ececec;
}

.add-btn {
    align-self: flex-start;
}
</style>