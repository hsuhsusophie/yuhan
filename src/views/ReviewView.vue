<script setup lang="ts">
import { useRouter } from 'vue-router'
import { reviewWords } from '@/data/study'

const router = useRouter()
</script>

<template>
  <div class="summary">
    <strong>今日の復習</strong>
    <span>{{ reviewWords.length }}語</span>
  </div>
  <p v-if="reviewWords.length === 0" class="page-kicker">あやふやにした単語が、ここに残ります。</p>
  <p v-else class="page-kicker">「あやふや」にした語です。</p>
  <div class="review-list">
    <article v-for="item in reviewWords" :key="item.hanzi" class="review-item">
      <div>
        <b>{{ item.hanzi }}</b>
        <small>{{ item.pinyin }}　{{ item.ja }}</small>
      </div>
    </article>
  </div>
  <div class="primary-row one">
    <button
      class="btn btn-solid"
      type="button"
      :disabled="reviewWords.length === 0"
      @click="router.push({ path: '/quiz', query: { pool: 'review' } })"
    >
      復習を始める
    </button>
  </div>
</template>
