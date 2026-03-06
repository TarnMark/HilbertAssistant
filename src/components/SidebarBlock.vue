<template>
    <div class="formula-section">
        <h3 class="section-title">
            {{ title }}
        </h3>

        <div class="formula-list">
            <div v-for="formula in formulas" :key="formula.name" class="formula-card">
                <div class="formula-name">{{ formula.name }}</div>

                <div class="formula-desc">
                    {{ formula.formula }}
                </div>

                <button @click="store.removeJustification(formula)" class="delete-btn">
                    ✕
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { VisualJustification } from '@/helpers';
import { useProofStore } from '@/stores/proofStore';
defineProps<{ title: string, formulas: VisualJustification[] }>()
const store = useProofStore()
</script>

<style scoped>
/* outer section (equivalent to mb-6) */
.formula-section {
    margin-bottom: 1.5rem;
}

/* section title */
.section-title {
    font-size: 0.75rem;
    font-weight: 700;
    color: #a3a3a3;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    margin-bottom: 1rem;

    display: flex;
    align-items: center;
    justify-content: space-between;
}

/* container for rows (space-y-3) */
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

/* slight hover feedback */
/* .formula-card:hover {
    border-color: #e5e5e5;
    background: #f8f8f8;
} */

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