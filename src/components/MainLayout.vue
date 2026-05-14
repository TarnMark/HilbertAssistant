<template>
    <div class="layout">
        <RulesSidebar @select-justification="ruleClicked" />
        <ProofEditor ref="editor" />
        <StatusPanel />
    </div>
</template>

<script setup lang="ts">
import RulesSidebar from './RulesSidebar.vue'
import ProofEditor from './ProofEditor.vue'
import StatusPanel from './StatusPanel.vue'
import { ref } from 'vue'

const editor = ref()

function ruleClicked(name: string) {
    editor.value.startWithData(name)
}

</script>

<style scoped>
.layout {
    flex: 1;
    display: grid;
    grid-template-columns: max-content 1fr 30%;
    overflow: auto;
    max-height: 84vh;
}
</style>