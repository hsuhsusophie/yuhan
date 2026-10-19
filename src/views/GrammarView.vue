<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { grammarByLevel } from '@/data/grammar'
import { level } from '@/data/study'

const index = ref(0)
const showAll = ref(false)
const grammarLessons = computed(() => grammarByLevel[level.value])
const lesson = computed(() => grammarLessons.value[index.value])

watch(level, () => {
  index.value = 0
  showAll.value = false
})

function open(next: number) {
  index.value = next
  showAll.value = false
  document.querySelector('.screen')?.scrollTo({ top: 0 })
}

function step(delta: number) {
  const next = index.value + delta
  if (next < 0 || next >= grammarLessons.value.length) return
  open(next)
}
</script>

<template>
  <div v-if="showAll" class="kicker-row">
    <button class="text-link" type="button" @click="showAll = false">この課へ</button>
    <p class="page-kicker">HSK {{ level }} · {{ grammarLessons.length }}課</p>
  </div>
  <div v-else class="kicker-row">
    <p class="page-kicker">{{ index + 1 }} / {{ grammarLessons.length }}</p>
    <button class="text-link" type="button" @click="showAll = true">すべて見る</button>
  </div>

  <section v-if="showAll" class="grammar-list">
    <button
      v-for="(item, i) in grammarLessons"
      :key="item.id"
      class="grammar-row"
      type="button"
      @click="open(i)"
    >
      <span class="row-index">{{ i + 1 }}</span>
      <span>
        <b>{{ item.title }}</b>
        <small>{{ item.group }}</small>
      </span>
    </button>
  </section>

  <template v-else-if="lesson">
    <article class="lesson">
      <h2>{{ lesson.group }}</h2>
      <p class="hanzi" :class="{ long: lesson.title.length > 6 }">{{ lesson.title }}</p>
      <p v-if="lesson.pinyin" class="pinyin">{{ lesson.pinyin }}</p>
      <p>{{ lesson.ja }}</p>
      <div v-for="example in lesson.examples" :key="example.zh" class="example">
        <strong>{{ example.zh }}</strong>
        <span>{{ example.pinyin }}　／　{{ example.ja }}</span>
      </div>
    </article>
    <div class="choices-row">
      <button class="btn btn-ghost" type="button" :disabled="index === 0" @click="step(-1)">前の課</button>
      <button
        v-if="index < grammarLessons.length - 1"
        class="btn btn-solid"
        type="button"
        @click="step(1)"
      >
        つぎの課
      </button>
      <RouterLink v-else to="/" class="btn btn-solid">ホームへ戻る</RouterLink>
    </div>
  </template>
</template>

<style scoped>
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

.hanzi.long {
  font-size: 28px;
  letter-spacing: 0;
  line-height: 1.35;
}

.grammar-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.grammar-row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  text-align: left;
  border: 0;
  border-radius: 18px;
  padding: 14px 16px;
  background: var(--paper-raised);
  box-shadow: inset 0 0 0 1px var(--line);
  color: var(--ink);
  font: inherit;
  cursor: pointer;
}

.grammar-row b {
  display: block;
  font-family: 'Noto Serif SC', serif;
  font-size: 18px;
  font-weight: 600;
}

.grammar-row small {
  display: block;
  margin-top: 2px;
  color: var(--ink-soft);
  font-size: 12px;
}

.row-index {
  width: 28px;
  flex: none;
  color: var(--ink-soft);
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}
</style>
