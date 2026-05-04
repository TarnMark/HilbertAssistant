<template>

  <div class="app-root">
    <TopBar @reset="store.initialized = false" />
    <div class="content-area">
      <InitModal v-if="!store.initialized" />
      <MainLayout v-else />
      <!-- <AppFooter /> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import TopBar from './components/TopBar.vue'
import MainLayout from './components/MainLayout.vue'
// import AppFooter from './components/AppFooter.vue'
import { useProofStore } from './stores/proofStore';
import InitModal from './components/InitModal.vue';

const store = useProofStore()
</script>

<style>
.app-root {
  display: flex;
  flex-direction: column;
  height: 95vh;
  font-family: Inter, system-ui, sans-serif;
}

.content-area {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>