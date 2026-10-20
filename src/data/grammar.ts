import hsk1 from './grammar-hsk1.json'
import hsk2 from './grammar-hsk2.json'
import hsk3 from './grammar-hsk3.json'
import hsk4 from './grammar-hsk4.json'
import hsk5 from './grammar-hsk5.json'
import hsk6 from './grammar-hsk6.json'

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
  4: hsk4.lessons as GrammarLesson[],
  5: hsk5.lessons as GrammarLesson[],
  6: hsk6.lessons as GrammarLesson[],
} as const
