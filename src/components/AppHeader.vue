<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isHome = computed(() => route.name === 'home')
const title = computed(() => route.meta.title ?? '漢語手帖')
</script>

<template>
  <header class="topbar">
    <div v-if="isHome" class="brand">
      <span class="seal">中</span>
      <div>
        <strong>漢語手帖</strong>
        <span>日本人のための中国語</span>
      </div>
    </div>
    <span v-if="isHome" class="pill">HSK 1</span>
    <h1 v-else>{{ title }}</h1>
  </header>
</template>
