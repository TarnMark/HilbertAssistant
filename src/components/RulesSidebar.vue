<template>
    <aside class="sidebar">

        <SidebarRow :formulas="assumptions" :title="'Hypotheses'"></SidebarRow>

        <SidebarRow :formulas="axioms" :title="'Axioms'"></SidebarRow>

        <SidebarRow :formulas="rules" :title="'Rules'"></SidebarRow>
    </aside>
</template>

<script setup lang="ts">
import { useProofStore } from '@/stores/proofStore';
import SidebarRow from './SidebarBlock.vue';

const store = useProofStore()

const justifications = store.availableJustifications//.filter(j => j.kind==='rule')

const rules = justifications.filter(j => j.category === 'rule')
const axioms = justifications.filter(j => j.category === 'axiom')
const assumptions = justifications.filter(j => j.category === 'assumption')
</script>

<style scoped>
.sidebar {
    background: white;
    border-right: 1px solid #e2e8f0;
    padding: 1rem;
    overflow-y: auto;
}
</style>