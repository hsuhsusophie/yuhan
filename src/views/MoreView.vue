<script setup lang="ts">
import { level, levelChoices, minuteChoices, minutes } from '@/data/study'
</script>

<template>
  <p class="page-kicker">いまの学習</p>
  <section class="panel">
    <div class="setting choices">
      <span>目標</span>
      <div class="choice-row">
        <button
          v-for="value in levelChoices"
          :key="value"
          class="choice"
          :class="{ on: level === value }"
          type="button"
          @click="level = value"
        >
          HSK {{ value }}
        </button>
      </div>
    </div>
    <div class="setting choices">
      <span>一日</span>
      <div class="choice-row">
        <button
          v-for="value in minuteChoices"
          :key="value"
          class="choice"
          :class="{ on: minutes === value }"
          type="button"
          @click="minutes = value"
        >
          {{ value }}分
        </button>
      </div>
    </div>
    <div class="setting">
      <span>内容</span>
      <b>単語・文法・テスト</b>
    </div>
  </section>
  <p class="about">
    日本語で中国語を覚える手帳です。ログインや音声練習は、この先で足せます。語彙とピンインは
    <a href="https://hearmandarin.com/datasets/">HearMandarin</a>
    の HSK 3.0 詞表（CC BY 4.0）です。
  </p>
</template>

<style scoped>
.choices {
  align-items: center;
}

.choice-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 6px;
}

.choice {
  border: 0;
  background: transparent;
  color: var(--ink);
  box-shadow: inset 0 0 0 1.5px #d9cbb8;
  border-radius: 999px;
  min-height: 32px;
  padding: 4px 10px;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.choice.on {
  background: var(--cinnabar);
  color: #fff8f4;
  box-shadow: none;
}
</style>
