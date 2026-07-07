import type { Passage } from '../data/schema'
import ItemMedia from './ItemMedia'
import RichText from './RichText'

interface PassagePanelProps {
  passage: Passage
}

/** 文章題の本文（国語・英語の長文など）。折りたたみ可能 */
export default function PassagePanel({ passage }: PassagePanelProps) {
  return (
    <details className="passage" open>
      <summary className="passage-summary">{passage.title ?? '本文を読む'}</summary>
      <div className="passage-body">
        <ItemMedia media={passage.media} />
        <p className="passage-text">
          <RichText text={passage.text} />
        </p>
      </div>
    </details>
  )
}
