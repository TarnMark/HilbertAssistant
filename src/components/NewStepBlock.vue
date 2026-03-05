<template>
    <div class="creation-block">
        <div class="header">
            <div class="title">
                <span class="badge">{{ stepNumber }}</span>
                New Step
            </div>
        </div>

        <div class="grid">
            <div>
                <label>Justification</label>
                <select v-model="selected">
                    <!-- <option value="">Select</option> -->
                    <option v-for="j in store.availableJustifications" :key="j.name" :value="j.name">
                        {{ j.name }}
                    </option>
                </select>
            </div>

            <div v-if="requiresInputs">
                <label>Input Steps</label>
                <div class="inputs">
                    <label v-for="step in store.steps" :key="step.index" class="input-option">
                        <input type="checkbox" :value="step.index" v-model="inputs" />
                        ({{ step.index }})
                    </label>
                </div>
            </div>

            <div>
                <label>Formula</label>
                <input v-model="formula" placeholder="A > A" />
            </div>
        </div>

        <div class="actions">
            <span class="error" v-if="error">{{ error }}</span>
            <button @click="commit">Commit Step</button>
            <button class="secondary" @click="$emit('cancel')">
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
    border: 1px solid #cbd5e1;
    padding: 1.25rem;
    margin-top: 1rem;
    background: #f8fafc;
}

.badge {
    background: #2563eb;
    color: white;
    padding: 4px 8px;
    margin-right: 8px;
    font-size: 0.75rem;
}

.grid {
    display: grid;
    gap: 1rem;
    margin-top: 1rem;
}

.inputs {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.input-option {
    font-size: 0.8rem;
}

.actions {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
    align-items: center;
}

.error {
    color: #dc2626;
    font-size: 0.8rem;
}
</style>