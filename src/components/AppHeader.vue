<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { level, levelChoices, type Level } from '@/data/study'

const route = useRoute()
const isHome = computed(() => route.name === 'home')
const title = computed(() => route.meta.title ?? '漢語手帖')
const open = ref(false)

watch(
  () => route.name,
  () => {
    open.value = false
  },
)

function choose(value: Level) {
  level.value = value
  open.value = false
}
</script>

<template>
  <header class="topbar">
    <div v-if="isHome" class="brand">
      <img class="seal" src="/dog.png" alt="" />
      <div>
        <strong>漢語手帖</strong>
        <span>日本人のための中国語</span>
      </div>
    </div>
    <div v-if="isHome" class="level-switch">
      <button
        class="pill"
        type="button"
        :aria-expanded="open"
        aria-label="級を選ぶ"
        @click="open = !open"
      >
        HSK {{ level }}
      </button>
      <button v-if="open" class="level-backdrop" type="button" aria-label="閉じる" @click="open = false"></button>
      <div v-if="open" class="level-menu">
        <button
          v-for="value in levelChoices"
          :key="value"
          type="button"
          :class="{ on: level === value }"
          @click="choose(value)"
        >
          HSK {{ value }}
        </button>
      </div>
    </div>
    <h1 v-else>{{ title }}</h1>
  </header>
</template>

<style scoped>
.level-switch {
  position: relative;
}

.pill {
  position: relative;
  z-index: 16;
  border: 0;
  cursor: pointer;
}

.level-backdrop {
  position: fixed;
  inset: 0;
  z-index: 15;
  border: 0;
  background: transparent;
}

.level-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 16;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 112px;
  padding: 6px;
  background: var(--paper-raised);
  border-radius: 16px;
  box-shadow:
    0 10px 24px rgba(27, 25, 22, 0.16),
    inset 0 0 0 1px var(--line);
}

.level-menu button {
  border: 0;
  background: transparent;
  border-radius: 999px;
  min-height: 36px;
  color: var(--ink);
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.level-menu button.on {
  background: var(--ink);
  color: #f6f1e8;
}
</style>
