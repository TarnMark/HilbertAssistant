import { AppError } from '../proof/AppError'

export type Formula = Atom | Implication | Negation //| UniversalQuantifier | ExistentialQuantifier

export function formulaToString(f: Formula, wrap = false): string {
  if (wrap) return wrapIfNeeded(f)

  switch (f.kind) {
    case 'atom':
      return f.name.replace('?', '')

    case 'not':
      return `¬${wrapIfNeeded(f.inner)}`

    case 'imp':
      return `${wrapIfNeeded(f.left)} → ${wrapIfNeeded(f.right)}`
  }
}

export function parseFormula(input: string, placeSchemaVars = false): Formula {
  const s = input.replace(/\s+/g, '')
  let i = 0

  function peek(): string | undefined {
    return i < s.length ? s[i] : undefined
  }

  function consume(): string {
    if (i >= s.length) {
      throw new AppError('feedback.errors.input.end')
    }
    return s[i++]!
  }

  function parseImplication(): Formula {
    const left = parseUnary()

    if (peek() === '>' || peek() === '→') {
      consume() // >
      const right = parseImplication() // right associative
      return imp(left, right)
    }

    return left
  }

  function parseUnary(): Formula {
    const ch = peek()

    if (!ch) throw new AppError('feedback.errors.input.end')

    if (ch === '-' || ch === '¬') {
      consume()
      return not(parseUnary())
    }

    if (ch === '(') {
      consume()
      const inside = parseImplication()
      if (consume() !== ')') {
        throw new AppError('feedback.errors.input.paren')
      }
      return inside
    }

    if (/[A-Za-z]/.test(ch)) {
      consume()
      return atom(placeSchemaVars ? '?' + ch : ch)
    }

    throw new AppError('feedback.errors.input.token', { ch })
  }

  const result = parseImplication()

  if (i !== s.length) {
    throw new AppError('feedback.errors.input.trailing')
  }

  return result
}

export function normalizeFormula(f: Formula): Formula {
  switch (f.kind) {
    case 'atom':
      return f

    case 'not':
      return {
        kind: 'not',
        inner: normalizeFormula(f.inner),
      }

    case 'imp': {
      const left = normalizeFormula(f.left)
      const right = normalizeFormula(f.right)

      return {
        kind: 'imp',
        left,
        right,
      }
    }
  }
}

export function collectSubformulas(
  f: Formula,
  acc = new Map<string, Formula>(),
): Map<string, Formula> {
  const norm = normalizeFormula(f)
  const key = formulaToString(norm)

  if (acc.has(key)) return acc
  acc.set(key, norm)

  switch (norm.kind) {
    case 'atom':
      break

    case 'not':
      collectSubformulas(norm.inner, acc)
      break

    case 'imp':
      collectSubformulas(norm.left, acc)
      collectSubformulas(norm.right, acc)
      break
  }

  return acc
}

function wrapIfNeeded(f: Formula): string {
  if (f.kind === 'atom' || (f.kind === 'not' && f.inner.kind === 'atom')) return formulaToString(f)
  return `(${formulaToString(f)})`
}

export function formulaEquals(a: Formula, b: Formula): boolean {
  if (a.kind !== b.kind) {
    return false
  }

  switch (a.kind) {
    case 'atom':
      return b.kind === 'atom' && a.name === b.name

    case 'imp':
      return b.kind === 'imp' && formulaEquals(a.left, b.left) && formulaEquals(a.right, b.right)

    case 'not':
      return b.kind === 'not' && formulaEquals(a.inner, b.inner)
  }
}

export function makeSchemaVariables(f: Formula): Formula {
  switch (f.kind) {
    case 'atom': {
      f.name = '?' + f.name
      return f
    }

    case 'not':
      return makeSchemaVariables(f.inner)

    case 'imp': {
      f.left = makeSchemaVariables(f.left)
      f.right = makeSchemaVariables(f.right)
      return f
    }
  }
}

export interface Atom {
  kind: 'atom'
  name: string
  //args?: Term[] // empty for propositional logic
}

export interface Implication {
  kind: 'imp'
  left: Formula
  right: Formula
}

export interface Negation {
  kind: 'not'
  inner: Formula
}

export function atom(name: string): Atom {
  return {
    kind: 'atom',
    name,
  }
}

export function imp(left: Formula, right: Formula): Implication {
  return {
    kind: 'imp',
    left,
    right,
  }
}

export function not(inner: Formula): Negation {
  return {
    kind: 'not',
    inner,
  }
}

// export interface UniversalQuantifier {
//   kind: 'forall'
//   variable: string
//   body: Formula
// }

// export interface ExistentialQuantifier {
//   kind: 'exists'
//   variable: string
//   body: Formula
// }

// import type { Term } from './Term'
