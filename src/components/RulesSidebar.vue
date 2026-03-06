<template>
    <aside class="sidebar">

        <SidebarRow :formulas="store.availableJustifications.filter(j => j.category === 'assumption')"
            :title="'Hypotheses'"></SidebarRow>

        <SidebarRow :formulas="store.availableJustifications.filter(j => j.category === 'axiom')" :title="'Axioms'">
        </SidebarRow>

        <SidebarRow :formulas="store.availableJustifications.filter(j => j.category === 'rule')" :title="'Rules'">
        </SidebarRow>
    </aside>
</template>

<script setup lang="ts">
import { useProofStore } from '@/stores/proofStore';
import SidebarRow from './SidebarBlock.vue';

const store = useProofStore()

</script>

<style scoped>
.sidebar {
    background: white;
    border-right: 1px solid #e2e8f0;
    padding: 1rem;
    overflow-y: auto;
}
</style>