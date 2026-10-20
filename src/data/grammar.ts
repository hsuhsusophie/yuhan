import hsk1 from './grammar-hsk1.json'
import hsk2 from './grammar-hsk2.json'
import hsk3 from './grammar-hsk3.json'

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

export const grammarAttribution = hsk1.attribution
export const grammarByLevel = {
  1: hsk1.lessons as GrammarLesson[],
  2: hsk2.lessons as GrammarLesson[],
  3: hsk3.lessons as GrammarLesson[],
} as const
