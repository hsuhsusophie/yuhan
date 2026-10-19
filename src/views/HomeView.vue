<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { grammarLessons } from '@/data/grammar'
import { dailyCount, streak, todayDone, week } from '@/data/study'

const done = computed(() => Math.min(todayDone.value, dailyCount))
const radius = 36
const circumference = 2 * Math.PI * radius
const dashOffset = computed(() => circumference * (1 - done.value / dailyCount))
</script>

<template>
  <section class="hero">
    <div class="hero-row">
      <div>
        <h2 class="greeting">你好</h2>
        <div class="streak">連続 {{ streak }}日</div>
        <p>今日は単語を{{ dailyCount }}語。5分で終わります。</p>
      </div>
      <div class="ring" :aria-label="`今日 ${done} / ${dailyCount}`">
        <svg viewBox="0 0 92 92">
          <circle cx="46" cy="46" :r="radius" fill="none" stroke="#463f39" stroke-width="7" />
          <circle
            cx="46"
            cy="46"
            :r="radius"
            fill="none"
            stroke="#f0c2b4"
            stroke-width="7"
            stroke-linecap="round"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="dashOffset"
          />
        </svg>
        <div class="ring-label">
          <strong>{{ done }}</strong>
          <span>/ {{ dailyCount }}</span>
        </div>
      </div>
    </div>
    <div class="week">
      <div v-for="day in week" :key="day.label" class="day">
        <span class="dot" :class="day.state"></span>
        {{ day.label }}
      </div>
    </div>
  </section>

  <div class="stack">
    <RouterLink to="/words" class="action">
      <span>
        <strong>今日の単語</strong>
        <small>ピンイン・声調・日本語　{{ dailyCount }}語</small>
      </span>
      <span class="chevron">›</span>
    </RouterLink>
    <RouterLink to="/grammar" class="action-quiet">
      <span>
        <strong>文法</strong>
        <small>HSK 1　{{ grammarLessons.length }}課</small>
      </span>
      <span class="chevron">›</span>
    </RouterLink>
  </div>
</template>
