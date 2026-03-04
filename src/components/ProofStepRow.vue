<template>
    <div class="row">
        <div class="index">
            <span class="status-dot valid">
                {{ step.index }}
            </span>
        </div>
        <div class="formula">{{ formulaToString(step.formula) }}</div>
        <div class="justification">
            {{ formatJustification(step.justification) }}
            <!-- <span v-if="step.justification.kind === 'rule' && step.justification.from.length">
                ({{ step.justification.from.join(', ') }})
            </span> -->
        </div>
    </div>
</template>

<script setup lang="ts">
import { formatJustification, formulaToString, type ProofStep } from '@/logic';
defineProps<{ step: ProofStep }>()
</script>