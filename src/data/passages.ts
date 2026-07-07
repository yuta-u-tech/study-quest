import type { Deck, DeckItem, Passage } from './schema'

/** 問題がデッキ内の実在する本文にひも付く文章題かを判定する。 */
export function passageForItem(item: DeckItem, deck: Deck): Passage | undefined {
  if (!item.passageId) return undefined
  return deck.passages?.find((passage) => passage.id === item.passageId)
}

/**
 * 本文の表示判定。
 * フラッシュカードは暗記に集中させ、それ以外のモードでは文章題だけ本文を表示する。
 */
export function passageForSession(
  item: DeckItem,
  deck: Deck,
  mode: string,
): Passage | undefined {
  if (mode === 'flashcard') return undefined
  return passageForItem(item, deck)
}
