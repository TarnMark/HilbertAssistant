<template>
    <section class="editor">
        <div class="toolbar">
            <span>
                <button @click="openCreator" :disabled="creating">
                    Add Step
                </button>
                <button @click="undoStep">Undo Step</button>
            </span>
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