import type { DeckItem } from './schema'

export type LearningMode =
  | 'flashcard'
  | 'choice'
  | 'test'
  | 'typing'
  | 'typing-recall'
  | 'input'

const DEFAULT_MODES: LearningMode[] = ['flashcard', 'choice', 'test']

/** 科目ごとの学習目的に合わせたモード構成。 */
const SUBJECT_MODES: Record<string, LearningMode[]> = {
  social: ['flashcard', 'choice', 'test', 'typing', 'typing-recall'],
  japanese: ['flashcard', 'choice', 'test', 'typing', 'typing-recall'],
  english: ['flashcard', 'choice', 'test', 'input'],
  math: ['flashcard', 'input'],
  science: ['flashcard', 'choice', 'test', 'input'],
}

export function modesForSubject(subject: string): LearningMode[] {
  return SUBJECT_MODES[subject] ?? DEFAULT_MODES
}

/** 解答形式に適さない問題が別モードへ混ざらないようにする。 */
export function itemSupportsMode(item: DeckItem, mode: string): boolean {
  switch (mode) {
    case 'flashcard':
      return item.type !== 'math' && item.type !== 'spelling'
    case 'choice':
    case 'test':
      return item.type === 'term' || item.type === 'choice'
    case 'typing':
    case 'typing-recall':
      return Boolean(item.reading)
    case 'input':
      return item.type === 'math' || item.type === 'spelling'
    default:
      return false
  }
}
