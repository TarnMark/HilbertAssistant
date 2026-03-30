<template>
    <aside class="sidebar">

        <SidebarBlock :formulas="store.availableJustifications.filter(j => j.category === 'assumption')"
            :title="'Hypotheses'" @select-justification="$emit('select-justification', $event)"></SidebarBlock>

        <SidebarBlock :formulas="store.availableJustifications.filter(j => j.category === 'axiom')"
            :title="'Axiom schemas'" :have_names="true" @select-justification="$emit('select-justification', $event)">
        </SidebarBlock>

        <SidebarBlock :formulas="store.availableJustifications.filter(j => j.category === 'rule')" :title="'Rules'"
            :have_names="true" :have_premises="true" @select-justification="$emit('select-justification', $event)">
        </SidebarBlock>
    </aside>
</template>

<script setup lang="ts">
import { useProofStore } from '@/stores/proofStore';
import SidebarBlock from './SidebarBlock.vue';

const store = useProofStore()

defineEmits(['select-justification'])

</script>

<style scoped>
.sidebar {
    background: white;
    border-right: 1px solid #e2e8f0;
    padding: 1rem;
    overflow-y: scroll;
}
</style>