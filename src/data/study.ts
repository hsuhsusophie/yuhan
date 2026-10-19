import { computed, ref, watch } from 'vue'
import catalog from './hsk1.json'

export interface Word {
  hanzi: string
  pinyin: string
  tones: number[]
  ja: string
}

export const words = catalog.words as Word[]
export const attribution = catalog.attribution
export const dailyCount = 10

interface Mark {
  hanzi: string
  result: 'known' | 'fuzzy'
  date: string
}

const storageKey = 'kango-progress'

function formatDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function today(): string {
  return formatDate(new Date())
}

function loadMarks(): Mark[] {
  try {
    const raw = localStorage.getItem(storageKey)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? (parsed as Mark[]) : []
  } catch {
    return []
  }
}

export const marks = ref<Mark[]>(loadMarks())

watch(
  marks,
  (value) => {
    localStorage.setItem(storageKey, JSON.stringify(value))
  },
  { deep: true },
)

function latest(hanzi: string): Mark | undefined {
  for (let index = marks.value.length - 1; index >= 0; index -= 1) {
    const mark = marks.value[index]
    if (mark?.hanzi === hanzi) return mark
  }
  return undefined
}

export function markWord(hanzi: string, result: 'known' | 'fuzzy') {
  marks.value.push({ hanzi, result, date: today() })
}

export const todayDone = computed(() => {
  const day = today()
  return new Set(marks.value.filter((mark) => mark.date === day).map((mark) => mark.hanzi)).size
})

export const dailyWords = computed(() => {
  const pending = words.filter((word) => latest(word.hanzi)?.result !== 'known')
  return (pending.length >= dailyCount ? pending : words).slice(0, dailyCount)
})

export const reviewWords = computed(() => words.filter((word) => latest(word.hanzi)?.result === 'fuzzy'))

export const streak = computed(() => {
  const studied = new Set(marks.value.map((mark) => mark.date))
  const cursor = new Date()
  if (!studied.has(today())) cursor.setDate(cursor.getDate() - 1)
  let count = 0
  while (studied.has(formatDate(cursor))) {
    count += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return count
})

export const week = computed(() => {
  const now = new Date()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  const studied = new Set(marks.value.map((mark) => mark.date))
  return ['月', '火', '水', '木', '金', '土', '日'].map((label, index) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + index)
    const key = formatDate(date)
    return { label, state: key === today() ? 'today' : studied.has(key) ? 'lit' : 'idle' }
  })
})

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1))
    const current = copy[index]
    copy[index] = copy[swap] as T
    copy[swap] = current as T
  }
  return copy
}

export function meaningQuiz(count = 10) {
  if (count <= 0) return []
  const picked = shuffle(words).slice(0, Math.min(count, words.length))
  return picked.map((word) => {
    const distractors = shuffle(words.filter((item) => item.hanzi !== word.hanzi && item.ja !== word.ja))
      .slice(0, 3)
      .map((item) => item.ja)
    const options = shuffle([word.ja, ...distractors])
    return {
      hanzi: word.hanzi,
      pinyin: word.pinyin,
      prompt: 'この漢字の意味は？',
      options,
      answer: options.indexOf(word.ja),
    }
  })
}
