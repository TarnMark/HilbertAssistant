<template>
    <h3>{{ title }}</h3>
    <div v-for="formula in formulas" :key="formula.name" class="formula">
        <span class="head-row">
            <div class="formula-name">{{ formula.name }}</div> <!--<button @click="removeFromRegistry">X</button> -->
        </span>
        <div class="formula-desc">{{ formula.formula }}</div>

    </div>
</template>

<script setup lang="ts">
import type { VisualJustification } from '@/helpers';
defineProps<{ title: string, formulas: VisualJustification[] }>()
// function removeFromRegistry() {
//     //TODO
// }
</script>

<style scoped>
.formula {
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    margin-bottom: 0.5rem;
    /* cursor: pointer; */
}

.formula:hover {
    border-color: #2563eb;
}

.formula-name {
    font-weight: 600;
    font-size: 0.8rem;
}

.formula-desc {
    font-family: monospace;
    font-size: 0.75rem;
}

.head-row {
    flex-direction: row;
    display: inline-flex;
    justify-content: stretch;
    justify-self: right;
}
</style>