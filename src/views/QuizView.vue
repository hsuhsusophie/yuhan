<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { buildQuiz, level, reviewWords, words, type QuizItem, type QuizKind } from '@/data/study'

const kinds: { id: QuizKind; label: string }[] = [
  { id: 'meaning', label: '意味' },
  { id: 'hanzi', label: '漢字' },
  { id: 'pinyin', label: 'ピンイン' },
]
const kindLabels: Record<QuizKind, string> = { meaning: '意味', hanzi: '漢字', pinyin: 'ピンイン' }
const router = useRouter()
const route = useRoute()
const reviewing = computed(() => route.query.pool === 'review')
const source = computed(() => (reviewing.value ? reviewWords.value : words.value))
const countChoices = computed(() => {
  const max = source.value.length
  const preset = [10, 20, 50].filter((value) => value <= max)
  if (max > 0 && max < 50 && !preset.includes(max)) preset.push(max)
  return preset.sort((a, b) => a - b)
})
const count = ref(10)
const kind = ref<QuizKind>('meaning')
const setupOpen = ref(true)
const fromDone = ref(false)
const quiz = ref<QuizItem[]>([])
const step = ref(0)
const picked = ref<number | null>(null)
const correctCount = ref(0)
const finished = computed(() => quiz.value.length > 0 && step.value >= quiz.value.length)
const item = computed(() => quiz.value[step.value])
const sheetNote = computed(() => {
  if (reviewing.value && source.value.length === 0) return 'あやふやの単語がありません'
  if (reviewing.value) return 'あやふやにした語から出題します'
  return `HSK ${level.value} の単語から出題します`
})

watch(
  countChoices,
  (list) => {
    const first = list[0]
    if (first !== undefined && !list.includes(count.value)) count.value = first
  },
  { immediate: true },
)

function start() {
  if (countChoices.value.length === 0) return
  quiz.value = buildQuiz(kind.value, count.value, source.value)
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
      <h2>{{ reviewing ? '復習' : '単語テスト' }}</h2>
      <p class="sheet-note">{{ sheetNote }}</p>
      <p class="sheet-label">出題</p>
      <div class="count-row">
        <button
          v-for="choice in kinds"
          :key="choice.id"
          class="count"
          :class="{ on: kind === choice.id }"
          type="button"
          @click="kind = choice.id"
        >
          {{ choice.label }}
        </button>
      </div>
      <p class="sheet-label">問題数</p>
      <div class="count-row">
        <button
          v-for="value in countChoices"
          :key="value"
          class="count"
          :class="{ on: count === value }"
          type="button"
          @click="count = value"
        >
          {{ value }}
        </button>
      </div>
      <button class="btn btn-solid" type="button" :disabled="countChoices.length === 0" @click="start">開始</button>
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
      <span>{{ kindLabels[kind] }}</span>
      <span>{{ step + 1 }} / {{ quiz.length }}</span>
    </div>
    <article class="study-card compact">
      <h2 :class="kind === 'hanzi' ? 'prompt-heading' : 'hanzi compact'">{{ item.heading }}</h2>
      <p v-if="item.showPinyin === 'always' || picked !== null" class="pinyin">{{ item.pinyin }}</p>
    </article>
    <p class="prompt">{{ item.prompt }}</p>
    <div class="options">
      <button
        v-for="(option, i) in item.options"
        :key="`${item.hanzi}-${i}`"
        class="option"
        :class="[choiceClass(i), kind === 'hanzi' ? 'glyph' : '']"
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

.prompt-heading {
  margin: 0;
  text-align: center;
  font-size: clamp(22px, 4.2vh, 32px);
  font-weight: 700;
  line-height: 1.35;
}

.option.glyph {
  font-family: 'Noto Serif SC', serif;
  font-size: 20px;
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
