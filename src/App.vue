<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import TabBar from './components/TabBar.vue'
</script>

<template>
  <div class="stage">
    <div class="phone">
      <AppHeader />
      <main class="screen">
        <RouterView />
      </main>
      <TabBar />
    </div>
  </div>
</template>
