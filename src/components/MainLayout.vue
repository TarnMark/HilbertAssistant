<template>
    <div class="layout">
        <RulesSidebar />
        <ProofEditor />
        <StatusPanel />
    </div>
</template>

<script setup lang="ts">
import RulesSidebar from './RulesSidebar.vue'
import ProofEditor from './ProofEditor.vue'
import StatusPanel from './StatusPanel.vue'
</script>

<style scoped>
.layout {
    flex: 1;
    display: grid;
    grid-template-columns: 280px 1fr 300px;
    overflow: hidden;
}
</style>