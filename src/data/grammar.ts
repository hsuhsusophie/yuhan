import catalog from './grammar-hsk1.json'

export interface GrammarExample {
  zh: string
  pinyin: string
  ja: string
}

export interface GrammarLesson {
  id: string
  group: string
  title: string
  pinyin: string
  ja: string
  examples: GrammarExample[]
}

export const grammarAttribution = catalog.attribution
export const grammarLessons = catalog.lessons as GrammarLesson[]
