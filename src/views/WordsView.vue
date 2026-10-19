<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { dailyWords, markWord, marks, words } from '@/data/study'

const index = ref(0)
const revealed = ref(false)
const showAll = ref(false)
const statusByHanzi = computed(() => {
  const map = new Map<string, 'known' | 'fuzzy'>()
  for (const mark of marks.value) map.set(mark.hanzi, mark.result)
  return map
})
const session = dailyWords.value.slice()
const finished = computed(() => index.value >= session.length)
const word = computed(() => session[index.value])

const tonePath: Record<number, string> = {
  1: 'M4 14 H60',
  2: 'M4 22 C22 22 38 8 60 6',
  3: 'M4 10 C16 10 20 22 32 22 C44 22 48 10 60 12',
  4: 'M4 6 C24 8 40 14 60 22',
  0: 'M22 16 H42',
}

function speak(hanzi: string) {
  const utterance = new SpeechSynthesisUtterance(hanzi)
  utterance.lang = 'zh-CN'
  utterance.rate = 0.85
  const voices = speechSynthesis.getVoices()
  const voice =
    voices.find((item) => item.lang.toLowerCase().replace('_', '-').startsWith('zh-cn')) ??
    voices.find((item) => item.lang.toLowerCase().startsWith('zh'))
  if (voice) utterance.voice = voice
  speechSynthesis.cancel()
  speechSynthesis.speak(utterance)
}

function scrollScreen() {
  document.querySelector('.screen')?.scrollTo({ top: 0 })
}

function openAll() {
  speechSynthesis.cancel()
  showAll.value = true
  scrollScreen()
}

function closeAll() {
  speechSynthesis.cancel()
  showAll.value = false
  scrollScreen()
}

function choose(result: 'known' | 'fuzzy') {
  const current = word.value
  if (!current) return
  speechSynthesis.cancel()
  markWord(current.hanzi, result)
  revealed.value = false
  index.value += 1
}
</script>

<template>
  <div v-if="showAll" class="kicker-row">
    <button class="text-link" type="button" @click="closeAll">今日の単語</button>
    <p class="page-kicker">HSK 1 · {{ words.length }}語</p>
  </div>
  <div v-else class="kicker-row">
    <p v-if="!finished" class="page-kicker">{{ index + 1 }} / {{ session.length }}</p>
    <span v-else></span>
    <button class="text-link" type="button" @click="openAll">すべて見る</button>
  </div>

  <section v-if="showAll" class="word-list">
    <article v-for="item in words" :key="item.hanzi" class="word-row">
      <p class="row-hanzi">{{ item.hanzi }}</p>
      <p class="row-pinyin">{{ item.pinyin }}</p>
      <p class="row-ja">{{ item.ja }}</p>
      <p v-if="statusByHanzi.get(item.hanzi) === 'known'" class="row-state known">覚えた</p>
      <p v-else-if="statusByHanzi.get(item.hanzi) === 'fuzzy'" class="row-state fuzzy">あやふや</p>
      <button class="speak row-speak" type="button" aria-label="聞く" @click="speak(item.hanzi)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M4 9.5v5h3.2L12 19V5L7.2 9.5H4z" />
          <path d="M15.2 9.2a3.2 3.2 0 0 1 0 5.6" />
          <path d="M17.6 6.8a6.2 6.2 0 0 1 0 10.4" />
        </svg>
      </button>
    </article>
  </section>

  <section v-else-if="finished" class="done">
    <p class="hanzi">好</p>
    <p>今日の{{ session.length }}語を見終わりました。</p>
    <RouterLink to="/" class="btn btn-solid">ホームへ戻る</RouterLink>
  </section>

  <template v-else-if="word && !showAll">
    <article class="study-card">
      <h2 class="hanzi">{{ word.hanzi }}</h2>
      <div class="pinyin-row">
        <p class="pinyin">
          {{ word.pinyin }}
          <button class="speak" type="button" aria-label="聞く" @click="speak(word.hanzi)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M4 9.5v5h3.2L12 19V5L7.2 9.5H4z" />
              <path d="M15.2 9.2a3.2 3.2 0 0 1 0 5.6" />
              <path d="M17.6 6.8a6.2 6.2 0 0 1 0 10.4" />
            </svg>
          </button>
        </p>
      </div>
      <div class="tones" aria-hidden="true">
        <svg v-for="(tone, i) in word.tones" :key="i" class="tone" viewBox="0 0 64 28">
          <path :d="tonePath[tone]" />
        </svg>
      </div>
      <template v-if="revealed">
        <p class="meaning">{{ word.ja }}</p>
      </template>
      <p v-else class="note">意味はまだ隠しています</p>
    </article>

    <div v-if="!revealed" class="primary-row one">
      <button class="btn btn-solid" type="button" @click="revealed = true">意味を見る</button>
    </div>
    <div v-else class="choices-row">
      <button class="btn btn-ghost" type="button" @click="choose('fuzzy')">あやふや</button>
      <button class="btn btn-solid" type="button" @click="choose('known')">覚えた</button>
    </div>
  </template>
</template>

<style scoped>
.pinyin-row {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-top: 10px;
}

.pinyin-row .pinyin {
  position: relative;
  margin: 0;
}

.speak {
  position: absolute;
  left: 100%;
  top: 50%;
  margin-left: 8px;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--cinnabar);
  display: grid;
  place-items: center;
  cursor: pointer;
  transform: translateY(-50%);
}

.speak svg {
  width: 22px;
  height: 22px;
}

.kicker-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 4px 0 12px;
}

.kicker-row .page-kicker {
  margin: 0;
}

.text-link {
  border: 0;
  padding: 0;
  background: transparent;
  color: var(--cinnabar);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.word-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.word-row {
  position: relative;
  background: var(--paper-raised);
  border-radius: 18px;
  padding: 14px 52px 14px 16px;
  box-shadow: inset 0 0 0 1px var(--line);
}

.row-hanzi {
  margin: 0;
  font-family: 'Noto Serif SC', serif;
  font-size: 22px;
  font-weight: 600;
  line-height: 1.3;
}

.row-pinyin {
  margin: 2px 0 0;
  color: var(--cinnabar);
  font-size: 13px;
}

.row-ja {
  margin: 4px 0 0;
  color: var(--ink-soft);
  font-size: 15px;
}

.row-state {
  margin: 6px 0 0;
  font-size: 12px;
  font-weight: 700;
}

.row-state.known {
  color: var(--moss);
}

.row-state.fuzzy {
  color: var(--cinnabar);
}

.word-row .row-speak {
  left: auto;
  right: 10px;
  top: 14px;
  margin-left: 0;
  transform: none;
}
</style>
