import { useEffect, useMemo, useState } from 'react'
import 'katex/dist/katex.min.css'

type KatexModule = typeof import('katex')

let katexPromise: Promise<KatexModule> | null = null
function loadKatex(): Promise<KatexModule> {
  katexPromise ??= import('katex')
  return katexPromise
}

interface Segment {
  math: boolean
  text: string
}

/** "$...$" を数式セグメントとして分割する */
export function splitMath(text: string): Segment[] {
  const segments: Segment[] = []
  const pattern = /\$([^$]+)\$/g
  let last = 0
  for (const match of text.matchAll(pattern)) {
    if (match.index > last) segments.push({ math: false, text: text.slice(last, match.index) })
    segments.push({ math: true, text: match[1] })
    last = match.index + match[0].length
  }
  if (last < text.length) segments.push({ math: false, text: text.slice(last) })
  return segments
}

interface RichTextProps {
  text: string
  className?: string
}

/** プレーン文と $...$ (KaTeX) の混在テキストを描画する */
export default function RichText({ text, className }: RichTextProps) {
  const segments = useMemo(() => splitMath(text), [text])
  const hasMath = segments.some((s) => s.math)
  const [katex, setKatex] = useState<KatexModule | null>(null)

  useEffect(() => {
    if (!hasMath || katex) return
    let active = true
    loadKatex().then(
      (module) => {
        if (active) setKatex(module)
      },
      (error) => console.error('katex load failed:', error),
    )
    return () => {
      active = false
    }
  }, [hasMath, katex])

  if (!hasMath) return <span className={className}>{text}</span>

  return (
    <span className={className}>
      {segments.map((segment, i) =>
        segment.math && katex ? (
          <span
            key={i}
            // KaTeX の出力は信頼できる自前データのみ
            dangerouslySetInnerHTML={{
              __html: katex.default.renderToString(segment.text, { throwOnError: false }),
            }}
          />
        ) : (
          <span key={i}>{segment.text}</span>
        ),
      )}
    </span>
  )
}
