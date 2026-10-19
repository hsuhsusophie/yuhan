<script setup lang="ts">
import { RouterLink } from 'vue-router'
import TabIcon from './TabIcon.vue'

const tabs = [
  { to: '/', label: 'ホーム', icon: 'home' },
  { to: '/words', label: '単語', icon: 'words' },
  { to: '/quiz', label: 'テスト', icon: 'quiz' },
  { to: '/review', label: '復習', icon: 'review' },
  { to: '/more', label: 'その他', icon: 'more' },
] as const
</script>

<template>
  <nav class="tabbar">
    <RouterLink v-for="tab in tabs" :key="tab.to" :to="tab.to" class="tab">
      <TabIcon :name="tab.icon" />
      {{ tab.label }}
    </RouterLink>
  </nav>
</template>
