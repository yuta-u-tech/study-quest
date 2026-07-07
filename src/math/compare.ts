/**
 * 数式・スペル解答の正誤判定。
 * MathLive の LaTeX 出力と、データ側の answer / acceptedAnswers を
 * 同じ正規形に落として比較する。数学的同値判定はしない
 * （表記ゆれは acceptedAnswers で列挙する方針）。
 */

// LaTeX の引数は {…} と 1文字省略形の両方がある（MathLive は \frac56 のような省略形を出力する）
const ARG = String.raw`(\{[^{}]*\}|[0-9a-zA-Z])`
const FRAC_PATTERN = new RegExp(String.raw`\\[dt]?frac\s*${ARG}\s*${ARG}`)
const SQRT_PATTERN = new RegExp(String.raw`\\sqrt\s*${ARG}`)

function stripBraces(arg: string): string {
  return arg.startsWith('{') ? arg.slice(1, -1) : arg
}

function normalizeFractions(input: string): string {
  let current = input
  for (let guard = 0; guard < 20; guard += 1) {
    const fraction = current.match(FRAC_PATTERN)
    if (fraction) {
      current = current.replace(
        FRAC_PATTERN,
        `(${stripBraces(fraction[1])})/(${stripBraces(fraction[2])})`,
      )
      continue
    }
    const root = current.match(SQRT_PATTERN)
    if (root) {
      current = current.replace(SQRT_PATTERN, `sqrt(${stripBraces(root[1])})`)
      continue
    }
    break
  }
  return current
}

export function normalizeMath(raw: string): string {
  const fractions = normalizeFractions(raw)
  return fractions
    .replace(/\\left|\\right/g, '')
    .replace(/\\cdot|\\times|×/g, '*')
    .replace(/\\div|÷/g, '/')
    .replace(/\\pi/g, 'π')
    .replace(/\\pm|±/g, '±')
    .replace(/[{}\s$]/g, '')
    .replace(/，|、/g, ',')
    .replace(/−/g, '-')
    .replace(/\(([a-z0-9.]+)\)/gi, '$1')
    .toLowerCase()
}

/** "3", "-1.5", "5/6" を数値化（それ以外は null） */
function numericValue(normalized: string): number | null {
  if (/^-?\d+(\.\d+)?$/.test(normalized)) return Number(normalized)
  const fraction = normalized.match(/^(-?\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/)
  if (fraction) {
    const denominator = Number(fraction[2])
    if (denominator !== 0) return Number(fraction[1]) / denominator
  }
  return null
}

export function isMathCorrect(
  input: string,
  answer: string,
  acceptedAnswers: string[] = [],
): boolean {
  const normalized = normalizeMath(input)
  if (normalized === '') return false

  const candidates = [answer, ...acceptedAnswers].map(normalizeMath)
  if (candidates.includes(normalized)) return true

  const inputValue = numericValue(normalized)
  if (inputValue === null) return false
  return candidates.some((c) => {
    const value = numericValue(c)
    return value !== null && Math.abs(value - inputValue) < 1e-9
  })
}

/** 英字入力（スペル等）の判定: 大文字小文字・前後空白を無視 */
export function isSpellingCorrect(
  input: string,
  answer: string,
  acceptedAnswers: string[] = [],
): boolean {
  const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ')
  const normalized = normalize(input)
  if (normalized === '') return false
  return [answer, ...acceptedAnswers].map(normalize).includes(normalized)
}
