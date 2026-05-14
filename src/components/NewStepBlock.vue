<template>
    <div class="creation-block">

        <div class="header">
            <div class="title">
                <span class="badge">{{ stepNumber }}</span>
                {{ t('main.components.newstep.title') }}
            </div>
        </div>

        <div class="fields">

            <div class="field">
                <label>{{ t('main.components.newstep.titles.justification') }}</label>
                <select v-model="draft.justification">
                    <option v-for="j in store.availableJustifications" :key="j.name" :value="j.name">
                        {{ j.name }}
                    </option>
                </select>
            </div>

            <div v-if="requiredInputs > 0 && selectedJustification.category === 'rule'" class="field">
                <label>{{ t('main.components.newstep.titles.steps') }}</label>
                <div class="rule-info">
                    {{draftStep.inputs.filter(i => i !== null).length}} / {{ requiredInputs }} {{
                        t('main.components.newstep.titles.inputs') }}
                </div>
                <div class="input-slots">
                    <div v-for="(slot, index) in requiredInputs" :key="index" class="input-slot"
                        :class="{ filled: draftStep.inputs[index] != null }"
                        @click="draft.inputs[index] = null; fillOutput">

                        <!-- Filled -->
                        <span v-if="draft.inputs[index] != null">
                            {{ draft.inputs[index].index + 1 }}
                        </span>

                        <!-- Placeholder -->
                        <span v-else class="placeholder">
                            {{ formulaToString(selectedJustification?.inputs![index]!) }}
                        </span>

                    </div>
                </div>
            </div>
            <div v-if="selectedJustification?.category === 'axiom'" class="field">

                <label>{{ t('main.components.newstep.titles.schemavars') }}</label>

                <div class="input-slots">

                    <div v-for="(slot, index) in requiredInputs" :key="index" @focusout="fillOutput"
                        class="input-slot substitution">

                        <FormulaInput v-model="substitutions[index]!"
                            :placeholder="formulaToString(selectedJustification.inputs![index]!)" />

                    </div>

                </div>
            </div>

            <div class="field">
                <label>{{ t('main.components.newstep.titles.formula') }}</label>
                <FormulaInput v-model="draft.formula" />
            </div>

        </div>

        <div class="actions">
            <span class="error" v-if="error">{{ error }}</span>

            <button class="btn-secondary" @click="$emit('cancel')">
                {{ t('main.components.newstep.buttons.cancel') }}
            </button>

            <button class="btn-primary" @click="commit"
                :disabled="!draft.justification || inputsNotFilled || store.status.kind === 'analyzing'">
                {{ t('main.components.newstep.buttons.commit') }}
            </button>
        </div>

    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useProofStore } from '../stores/proofStore'
import FormulaInput from './FormulaInput.vue';
import { formulaToString, matchWithBindings, parseFormula, type Formula, type ProofStep } from '@/logic';
import { useI18n } from 'vue-i18n';
import { toJust } from '@/logic/proof/Justification';

const props = defineProps<{
    stepNumber: number, draftStep: {
        justification: string | null,
        inputs: (ProofStep | null)[],
        formula: string,
        rawFormula?: string
    }
}>()

const emit = defineEmits(['committed', 'cancel'])

const { t } = useI18n()
const store = useProofStore()
const draft = reactive(props.draftStep)
const error = ref<string | null>(null)

const requiredInputs = computed(() =>
    selectedJustification.value?.inputs?.length ?? 0
)

const selectedJustification = computed(() =>
    store.availableJustifications.find(j => j.name === draft.justification)!
)

const inputsNotFilled = computed(() =>
    selectedJustification.value?.category === 'rule' && (draft.inputs.length < requiredInputs.value || draft.inputs.some(i => i === null))
)

const defaultSubs = computed<Record<number, string>>(() => {
    const subs = {} as Record<number, string>
    for (let index = 0; index < requiredInputs.value; index++) {
        subs[index] = '';
    }
    return subs
})
const substitutions = ref<Record<number, string>>(defaultSubs.value)

watch(
    () => draft.justification,
    () => {
        error.value = null
        draft.inputs = []
        draft.formula = ''
        substitutions.value = defaultSubs.value
        if (draft.justification !== null && draft.justification !== '')
            store.setStatus({ kind: 'hint', message: 'feedback.hints.newstep.' + (selectedJustification.value.category ?? 'creating') })
        fillOutput()
    }
)

watch(
    () => draft.inputs.filter(i => i !== null).length,
    () => {
        fillOutput()
    }
)

watch(
    () => substitutions.value,
    () => {
        fillOutput()
    }
)

onMounted(
    () => {
        draft.formula = selectedJustification.value?.formula ?? ''
        substitutions.value = defaultSubs.value
        draft.rawFormula = draft.formula
    }
)

function fillOutput() {
    // if (inputsNotFilled.value) return
    error.value = null
    draft.rawFormula = selectedJustification.value.formula
    draft.formula = substitute(draft.rawFormula, substitution())
}

function substitute(
    formula: string,
    subst: Record<string, Formula>
): string {
    let result = ""

    for (let i = 0; i < formula.length; i++) {
        const ch = formula[i]!

        if (/[A-Z]/.test(ch)) {
            if (subst[ch]) {
                result += `${formulaToString(subst[ch], true)}`
            }
            else if (subst['?' + ch]) {
                result += `${formulaToString(subst['?' + ch]!, true)}`
            } else {
                result += ch
            }
        } else {
            result += ch
        }
    }

    return result
}


function substitution(): Record<string, Formula> {
    if (!selectedJustification.value) return {}

    let subst: Record<string, Formula> | null = {}

    const patterns = selectedJustification.value.inputs ?? []
    const inputs = draft.inputs

    for (let i = 0; i < patterns.length; i++) {
        const pattern = patterns[i]
        let input = null
        try { input = (substitutions.value[i] !== '') ? (parseFormula(substitutions.value[i]!)) : inputs[i]?.formula }
        catch { error.value = t('feedback.errors.newstep.schemavar') }

        if (!pattern || !input) continue

        subst = matchWithBindings(pattern, input, subst)
        if (!subst) return {}
    }

    return subst
}


function commit() {
    const selected = selectedJustification.value
    if (!selected) {
        error.value = t('feedback.errors.newstep.justification')
    }
    if (!inputsNotFilled.value) {
        error.value = t('feedback.errors.newstep.few_inputs')
    }
    const just = toJust(selected!, draft.inputs.map(i => i?.index) as number[])

    const result = store.commitStep(
        draft.formula,
        just,
    )

    if (!result.success) {
        error.value = result.error?.data ? t(result.error.name, result.error.data) : t('feedback.errors.newstep.invalid')
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
    margin: 1rem;

    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}

.rule-info {
    font-size: 11px;
    color: #6b7280;
}

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


select {
    /* width: 100%; */

    padding: 0.5rem 0.75rem;

    border-radius: 0.5rem;

    border: 1px solid #e5e5e5;

    background: white;

    font-size: 0.9rem;

    outline: none;

    transition: border-color 0.15s, box-shadow 0.15s;

    font-family: monospace;
}

select:focus {
    /* border: #4f46e5; */

    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.15);
}

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



label {
    font-size: 0.65rem;

    font-weight: 700;

    color: #a3a3a3;

    letter-spacing: 0.05em;

    text-transform: uppercase;
}

select,
input[type="text"],
input[type="checkbox"] {
    font-size: 0.9rem;
}


/* input steps container */
.input-slots {
    display: flex;
    gap: 8px;

    padding: 6px;

    border: 1px solid #d8dce6;
    border-radius: 8px;

    background: white;

    align-content: center;
}


.input-slot {
    flex: 1;

    min-width: 60px;
    height: 36px;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 6px;

    border: 1px dashed #c9cfdb;

    font-size: 12px;

    transition: all 0.15s;
}


.input-slot.filled {
    border-style: solid;

    background: #eef3ff;

    border-color: #1b66d8;

    color: #1b66d8;

    font-weight: 600;

    cursor: pointer;
}

.input-slot.substitution {
    /* background: #f4f7ff; */
    border: none;
    display: flex;
    align-content: stretch;
}

.input-slot input {
    width: 100%;
}


.input-slot:hover {
    border-color: #1b66d8;
}

.input-slot.filled:hover {
    background-color: #a1000099;
    border: 1px solid red;
}

.placeholder {
    color: #9aa1ad;

    font-style: italic;

    font-size: 11px;

    text-align: center;
}


.input-steps {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;

    padding: 6px;

    border-radius: 6px;
    border: 1px solid #d8dce6;

    background: white;

    min-height: 30px;
}


.input-chip {
    font-size: 11px;

    background: #eef2ff;

    border-radius: 4px;
    border: 1px solid #dbe3f2;

    padding: 6px 10px;

    cursor: pointer;
}

.input-chip:hover {
    background-color: #a1000099;
    border: 1px solid red;
}


.input-placeholder {
    font-size: 11px;
    color: #9aa1ad;
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

.btn-primary:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    box-shadow: none;
}

/* error text */

.error {
    margin-right: auto;

    font-size: 0.75rem;

    color: #dc2626;

    font-weight: 500;
}
</style>