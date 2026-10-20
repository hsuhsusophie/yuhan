import { computed, ref, watch } from 'vue'
import hsk1 from './hsk1.json'
import hsk2 from './hsk2.json'
import hsk3 from './hsk3.json'
import traditionalHanzi from './hanzi-traditional.json'

export interface Word {
  hanzi: string
  pinyin: string
  tones: number[]
  ja: string
}

export const levelChoices = [1, 2, 3] as const
export type Level = (typeof levelChoices)[number]

const catalogs: Record<Level, Word[]> = {
  1: hsk1.words as Word[],
  2: hsk2.words as Word[],
  3: hsk3.words as Word[],
}
export const attribution = hsk1.attribution

const settingsKey = 'kango-settings'
export const minuteChoices = [5, 10, 20] as const

function loadSettings(): { minutes: number; level: Level } {
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
export const level = ref<Level>(savedSettings.level)
export const words = computed(() => catalogs[level.value])
export const dailyCount = computed(() => minutes.value * 2)

watch([minutes, level], () => {
  localStorage.setItem(settingsKey, JSON.stringify({ minutes: minutes.value, level: level.value }))
})

interface Mark {
  hanzi: string
  pinyin?: string
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

const hanziTraditional = traditionalHanzi as Record<string, string>
const speechByTraditional = new Map<string, string>()
const speechByCharacter = new Map<string, string>()
for (const [simplified, traditional] of Object.entries(hanziTraditional)) {
  speechByTraditional.set(traditional, simplified)
  const from = [...simplified]
  const to = [...traditional]
  if (from.length !== to.length) continue
  for (let index = 0; index < from.length; index += 1) {
    const source = from[index]
    const target = to[index]
    if (source && target && source !== target) speechByCharacter.set(target, source)
  }
}

export function speechText(hanzi: string): string {
  const whole = speechByTraditional.get(hanzi)
  if (whole) return whole
  return [...hanzi].map((character) => speechByCharacter.get(character) ?? character).join('')
}

function loadMarks(): Mark[] {
  try {
    const raw = localStorage.getItem(storageKey)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    if (!Array.isArray(parsed)) return []
    return (parsed as Mark[]).map((mark) => ({
      ...mark,
      hanzi: hanziTraditional[mark.hanzi] ?? mark.hanzi,
    }))
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

function wordKey(word: Pick<Word, 'hanzi' | 'pinyin'>): string {
  return `${word.hanzi}\n${word.pinyin}`
}

function latest(word: Pick<Word, 'hanzi' | 'pinyin'>): Mark | undefined {
  for (let index = marks.value.length - 1; index >= 0; index -= 1) {
    const mark = marks.value[index]
    if (!mark || mark.hanzi !== word.hanzi) continue
    if (mark.pinyin && mark.pinyin !== word.pinyin) continue
    return mark
  }
  return undefined
}

export function markWord(word: Pick<Word, 'hanzi' | 'pinyin'>, result: 'known' | 'fuzzy') {
  marks.value.push({ hanzi: word.hanzi, pinyin: word.pinyin, result, date: today() })
}

export const todayDone = computed(() => {
  const day = today()
  const inLevel = new Set(words.value.map(wordKey))
  const done = new Set<string>()
  for (const mark of marks.value) {
    if (mark.date !== day) continue
    if (mark.pinyin) {
      const key = wordKey({ hanzi: mark.hanzi, pinyin: mark.pinyin })
      if (inLevel.has(key)) done.add(key)
    } else if (words.value.some((word) => word.hanzi === mark.hanzi)) {
      done.add(mark.hanzi)
    }
  }
  return done.size
})

export const dailyWords = computed(() => {
  const list = words.value
  const pending = list.filter((word) => latest(word)?.result !== 'known')
  const count = dailyCount.value
  return (pending.length >= count ? pending : list).slice(0, count)
})

export const reviewWords = computed(() => words.value.filter((word) => latest(word)?.result === 'fuzzy'))

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

export function buildQuiz(kind: QuizKind, count: number, source: Word[] = words.value): QuizItem[] {
  if (count <= 0 || source.length === 0) return []
  const picked = shuffle(source).slice(0, Math.min(count, source.length))
  const copy = quizCopy[kind]
  return picked.map((word) => {
    const correct = answerText(word, kind)
    const distractors = shuffle(
      words.value.filter((item) => item.hanzi !== word.hanzi && answerText(item, kind) !== correct),
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
