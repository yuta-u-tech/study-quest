import { describe, expect, it } from 'vitest'
import type { Deck, DeckItem } from './schema'
import { passageForItem, passageForSession } from './passages'

const item: DeckItem = {
  id: 'q1',
  type: 'choice',
  section: '読解',
  number: 1,
  question: '本文の内容を答えなさい。',
  answer: '答え',
  passageId: 'story',
}

const deck: Deck = {
  schemaVersion: 1,
  id: 'reading',
  subject: 'japanese',
  title: '文章読解',
  passages: [{ id: 'story', title: '本文', text: 'これは本文です。' }],
  items: [item],
}

describe('文章題の判定', () => {
  it('実在する passageId を持つ問題を文章題と判定する', () => {
    expect(passageForItem(item, deck)?.id).toBe('story')
  })

  it('passageId がない問題は文章題にしない', () => {
    expect(passageForItem({ ...item, passageId: undefined }, deck)).toBeUndefined()
  })

  it('存在しない passageId は文章題にしない', () => {
    expect(passageForItem({ ...item, passageId: 'missing' }, deck)).toBeUndefined()
  })

  it('フラッシュカードでは文章題でも本文を表示しない', () => {
    expect(passageForSession(item, deck, 'flashcard')).toBeUndefined()
  })

  it('4択では文章題にだけ本文を表示する', () => {
    expect(passageForSession(item, deck, 'choice')?.id).toBe('story')
    expect(
      passageForSession({ ...item, passageId: undefined }, deck, 'choice'),
    ).toBeUndefined()
  })
})
