<template>
  <div class="app-root">
    <TopBar />
    <MainLayout />
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import TopBar from './components/TopBar.vue'
import MainLayout from './components/MainLayout.vue'
import AppFooter from './components/AppFooter.vue'
</script>

<style>
.app-root {
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-family: Inter, system-ui, sans-serif;
}
</style>