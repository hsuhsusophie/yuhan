<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { meaningQuiz } from '@/data/study'

const counts = [10, 20, 50]
const router = useRouter()
const count = ref(10)
const setupOpen = ref(true)
const fromDone = ref(false)
const quiz = ref(meaningQuiz(0))
const step = ref(0)
const picked = ref<number | null>(null)
const correctCount = ref(0)
const finished = computed(() => quiz.value.length > 0 && step.value >= quiz.value.length)
const item = computed(() => quiz.value[step.value])

function start() {
  quiz.value = meaningQuiz(count.value)
  step.value = 0
  picked.value = null
  correctCount.value = 0
  fromDone.value = false
  setupOpen.value = false
  document.querySelector('.screen')?.scrollTo({ top: 0 })
}

function cancel() {
  if (fromDone.value) {
    setupOpen.value = false
    return
  }
  if (window.history.state?.back) router.back()
  else router.push('/')
}

function again() {
  fromDone.value = true
  setupOpen.value = true
}

function pick(option: number) {
  if (picked.value !== null || !item.value) return
  picked.value = option
  if (option === item.value.answer) correctCount.value += 1
}

function next() {
  picked.value = null
  step.value += 1
}

function choiceClass(option: number) {
  if (picked.value === null || !item.value) return ''
  if (option === item.value.answer) return 'right'
  if (option === picked.value) return 'wrong'
  return ''
}
</script>

<template>
  <div v-if="setupOpen" class="quiz-setup">
    <section class="quiz-sheet">
      <h2>単語テスト</h2>
      <p class="sheet-note">HSK 1 の単語から出題します</p>
      <p class="sheet-label">問題数</p>
      <div class="count-row">
        <button
          v-for="value in counts"
          :key="value"
          class="count"
          :class="{ on: count === value }"
          type="button"
          @click="count = value"
        >
          {{ value }}
        </button>
      </div>
      <button class="btn btn-solid" type="button" @click="start">開始</button>
      <button class="btn btn-ghost" type="button" @click="cancel">キャンセル</button>
    </section>
  </div>

  <section v-else-if="finished" class="done">
    <p class="hanzi">{{ correctCount }}</p>
    <p>{{ quiz.length }}問中 {{ correctCount }}問できました。</p>
    <button class="btn btn-solid" type="button" @click="again">もう一度</button>
    <RouterLink to="/" class="btn btn-ghost">ホームへ戻る</RouterLink>
  </section>

  <div v-else-if="item" class="quiz-play">
    <div class="quiz-head">
      <span>意味</span>
      <span>{{ step + 1 }} / {{ quiz.length }}</span>
    </div>
    <article class="study-card compact">
      <h2 class="hanzi compact">{{ item.hanzi }}</h2>
      <p class="pinyin">{{ item.pinyin }}</p>
    </article>
    <p class="prompt">{{ item.prompt }}</p>
    <div class="options">
      <button
        v-for="(option, i) in item.options"
        :key="`${item.hanzi}-${i}`"
        class="option"
        :class="choiceClass(i)"
        type="button"
        @click="pick(i)"
      >
        {{ option }}
      </button>
    </div>
    <p v-if="picked !== null" class="feedback" :class="picked === item.answer ? 'ok' : 'ng'">
      {{ picked === item.answer ? 'できました' : `答えは「${item.options[item.answer]}」` }}
    </p>
    <div v-if="picked !== null" class="primary-row one">
      <button class="btn btn-solid" type="button" @click="next">つぎへ</button>
    </div>
  </div>
</template>

<style scoped>
.quiz-setup {
  position: absolute;
  inset: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 16px;
  background: rgba(27, 25, 22, 0.46);
}

.quiz-sheet {
  width: min(100%, 360px);
  background: var(--paper-raised);
  border-radius: 24px;
  padding: 22px 18px 16px;
  box-shadow: 0 18px 40px rgba(27, 25, 22, 0.2);
}

.quiz-sheet h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}

.sheet-note,
.sheet-label {
  margin: 8px 0 0;
  color: var(--ink-soft);
  font-size: 13px;
}

.sheet-label {
  margin-top: 18px;
  font-weight: 700;
}

.count-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin: 10px 0 16px;
}

.count {
  min-height: 44px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--ink);
  box-shadow: inset 0 0 0 1.5px #d9cbb8;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.count.on {
  background: var(--cinnabar);
  color: #fff8f4;
  box-shadow: none;
}

.quiz-sheet .btn {
  width: 100%;
}

.quiz-sheet .btn + .btn {
  margin-top: 8px;
}

.done .btn {
  width: min(100%, 320px);
}

.done .btn + .btn {
  margin-top: 14px;
}

.quiz-play {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.quiz-play .study-card {
  flex: 1 1 auto;
  min-height: 0;
  padding: 12px 16px;
}

.quiz-play .hanzi {
  font-size: clamp(36px, 7vh, 52px);
}

.quiz-play .pinyin {
  margin-top: 4px;
  font-size: 18px;
  line-height: 1.2;
}

.quiz-play .prompt {
  margin: 8px 0;
}

.quiz-play .options {
  gap: 8px;
}

.quiz-play .option {
  min-height: 42px;
  padding: 8px 14px;
}

.quiz-play .feedback {
  margin: 8px 0 0;
}

.quiz-play .primary-row {
  margin-top: 8px;
}

.quiz-play .btn {
  min-height: 44px;
}
</style>
