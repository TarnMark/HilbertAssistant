<template>
    <div class="formula-card new">

        <div v-if="allowName" class="field">
            <label>Name</label>
            <input v-model="name" placeholder="Justification name" />
            <!-- <div v-else class="formula-name">{{  }}</div> -->
        </div>

        <div v-if="allowPremises" class="field">
            <label>Premises</label>

            <div class="premise-list">

                <div v-for="(p, i) in premises" :key="i" class="premise-row">
                    <!-- <input v-model="premises[i]" placeholder="Premise formula" /> -->
                    <FormulaInput v-model="premises[i]!" class="premise-input" />

                    <button class="delete-btn small" @click="removePremise(i)">
                        ✕
                    </button>
                </div>

            </div>

            <button class="secondary-btn" @click="addPremise" v-if="allowPremises">
                + Add premise
            </button>
        </div>

        <div class="field">
            <label>Formula</label>
            <!-- <input v-model="formula" placeholder="A → B" /> -->
            <FormulaInput v-model="formula" />
        </div>

        <div class="actions">
            <button class="secondary-btn" @click="$emit('cancel')">
                Cancel
            </button>

            <button class="primary-btn" @click="submit">
                Add
            </button>
        </div>

    </div>
</template>

<script setup lang="ts">
import { parseFormula } from "@/helpers";
import { ref } from "vue"
import FormulaInput from "./FormulaInput.vue";
const props = defineProps<{
    allowName?: boolean,
    allowPremises?: boolean
}>()

const emit = defineEmits(["create", "cancel"])

const name = ref("")
const formula = ref("")
const premises = ref<string[]>([])

function addPremise() {
    premises.value.push("")
}

function removePremise(i: number) {
    premises.value.splice(i, 1)
}

function submit() {
    emit("create", {
        name: props.allowName ? name.value : 'Hypothesis',
        category: !props.allowName ? 'assumption' : !props.allowPremises ? 'axiom' : 'rule',
        formula: formula.value,
        inputs: premises.value.filter(f => f.length > 0).map(f => parseFormula(f))
    })
}
</script>

<style scoped>
.formula-card.new {
    background: #f7f9fc;
    border: 1px solid #dbe3f2;
}


.field {
    display: flex;
    flex-direction: column;

    margin-bottom: 8px;
}

.field label {
    font-size: 10px;
    font-weight: 700;

    color: #7a7a7a;

    margin-bottom: 4px;

    text-transform: uppercase;
}


.field input {
    padding: 6px 8px;

    border-radius: 6px;
    border: 1px solid #e3e3e3;

    font-family: monospace;
}


.premise-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 6px;
    justify-content: right;
}

.premise-row {
    display: flex;
    /* align-items: baseline; */
    gap: 6px;
    /* flex; */
}

.premise-input {
    width: 100%;
}

.delete-btn.small {
    width: 20px;
    height: 20px;

    font-size: 12px;

    border: none;
    padding: 0.4rem 0.4rem;

    background: transparent;
    color: #c4c4c4;

    /* font-size: 1rem; */

    transition: color 0.15s;
    cursor: pointer;
}

.delete-btn:hover {
    color: #ef4444;
}


.actions {
    display: flex;
    justify-content: flex-end;
    gap: 6px;
    margin-top: 6px;
}


.primary-btn {
    padding: 4px 10px;

    background: #1b66d8;
    color: white;

    border-radius: 6px;
    border: none;

    cursor: pointer;
}

.primary-btn:hover {
    background: #103772;
}


.secondary-btn {
    padding: 4px 10px;

    background: #f1f1f1;

    border-radius: 6px;
    border: none;

    cursor: pointer;
}
</style>