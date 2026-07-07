import { useEffect, useRef } from 'react'
import type { MathfieldElement } from 'mathlive'

let configured = false

async function ensureMathlive(): Promise<void> {
  const { MathfieldElement } = await import('mathlive')
  if (!configured) {
    configured = true
    MathfieldElement.fontsDirectory = 'https://unpkg.com/mathlive@0.110.0/fonts/'
    MathfieldElement.soundsDirectory = null
  }
}

interface MathFieldProps {
  onChange: (latex: string) => void
  onSubmit: () => void
  disabled: boolean
}

/**
 * MathLive の数式入力欄。/ で分数、^ で指数がその場でレンダリングされ、
 * 矢印キーで分子・分母などへカーソル移動できる。
 */
export default function MathField({ onChange, onSubmit, disabled }: MathFieldProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const fieldRef = useRef<MathfieldElement | null>(null)
  const handlersRef = useRef({ onChange, onSubmit })
  handlersRef.current = { onChange, onSubmit }

  useEffect(() => {
    let active = true
    void ensureMathlive().then(async () => {
      if (!active || !hostRef.current || fieldRef.current) return
      const { MathfieldElement } = await import('mathlive')
      if (!active || !hostRef.current) return
      const field = new MathfieldElement()
      field.className = 'math-input-field'
      field.addEventListener('input', () => handlersRef.current.onChange(field.getValue('latex')))
      field.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          handlersRef.current.onSubmit()
        }
      })
      hostRef.current.appendChild(field)
      fieldRef.current = field
      field.focus()
    })
    return () => {
      active = false
      fieldRef.current?.remove()
      fieldRef.current = null
    }
  }, [])

  useEffect(() => {
    if (fieldRef.current) fieldRef.current.readOnly = disabled
  }, [disabled])

  return <div ref={hostRef} className="math-input-host" />
}
