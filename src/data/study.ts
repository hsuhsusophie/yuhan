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

const settingsKey = 'kango-settings'
export const minuteChoices = [5, 10, 20] as const
export const levelChoices = [1] as const

function loadSettings(): { minutes: number; level: number } {
  try {
    if (typeof localStorage === 'undefined') return { minutes: 5, level: 1 }
    const raw = localStorage.getItem(settingsKey)
    const parsed: unknown = raw ? JSON.parse(raw) : {}
    const saved = parsed && typeof parsed === 'object' ? (parsed as { minutes?: number; level?: number }) : {}
    const minutes = minuteChoices.find((value) => value === saved.minutes) ?? 5
    const level = levelChoices.find((value) => value === saved.level) ?? 1
    return { minutes, level }
  } catch {
    return { minutes: 5, level: 1 }
  }
}

const savedSettings = loadSettings()
export const minutes = ref(savedSettings.minutes)
export const level = ref(savedSettings.level)
export const dailyCount = computed(() => minutes.value * 2)

watch([minutes, level], () => {
  localStorage.setItem(settingsKey, JSON.stringify({ minutes: minutes.value, level: level.value }))
})

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
  const count = dailyCount.value
  return (pending.length >= count ? pending : words).slice(0, count)
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

export type QuizKind = 'meaning' | 'hanzi' | 'pinyin'

export interface QuizItem {
  hanzi: string
  pinyin: string
  heading: string
  prompt: string
  showPinyin: 'always' | 'after'
  options: string[]
  answer: number
}

const quizCopy: Record<QuizKind, { prompt: string; showPinyin: 'always' | 'after' }> = {
  meaning: { prompt: 'この漢字の意味は？', showPinyin: 'always' },
  hanzi: { prompt: 'この意味の漢字は？', showPinyin: 'after' },
  pinyin: { prompt: 'この漢字のピンインは？', showPinyin: 'after' },
}

function answerText(word: Word, kind: QuizKind): string {
  if (kind === 'hanzi') return word.hanzi
  if (kind === 'pinyin') return word.pinyin
  return word.ja
}

export function buildQuiz(kind: QuizKind, count: number, source: Word[] = words): QuizItem[] {
  if (count <= 0 || source.length === 0) return []
  const picked = shuffle(source).slice(0, Math.min(count, source.length))
  const copy = quizCopy[kind]
  return picked.map((word) => {
    const correct = answerText(word, kind)
    const distractors = shuffle(
      words.filter((item) => item.hanzi !== word.hanzi && answerText(item, kind) !== correct),
    )
      .slice(0, 3)
      .map((item) => answerText(item, kind))
    const options = shuffle([correct, ...distractors])
    return {
      hanzi: word.hanzi,
      pinyin: word.pinyin,
      heading: kind === 'hanzi' ? word.ja : word.hanzi,
      prompt: copy.prompt,
      showPinyin: copy.showPinyin,
      options,
      answer: options.indexOf(correct),
    }
  })
}
