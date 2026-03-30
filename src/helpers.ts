import { atom, imp, not, type Formula, type Justification } from './logic'

export function parseFormula(input: string): Formula {
  const s = input.replace(/\s+/g, '')
  let i = 0

  function peek(): string | undefined {
    return i < s.length ? s[i] : undefined
  }

  function consume(): string {
    if (i >= s.length) {
      throw new Error('Unexpected end of input')
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

    if (ch === '-' || ch === '¬') {
      consume()
      return not(parseUnary())
    }

    if (ch === '(') {
      consume()
      const inside = parseImplication()
      if (consume() !== ')') {
        throw new Error("Expected ')'")
      }
      return inside
    }

    if (ch && /[A-Za-z]/.test(ch)) {
      consume()
      return atom(ch)
    }

    throw new Error(`Unexpected token: ${ch}`)
  }

  const result = parseImplication()

  if (i !== s.length) {
    throw new Error('Unexpected trailing input')
  }

  return result
}

export type VisualJustification = {
  name: string
  formula: string
  category: 'assumption' | 'axiom' | 'rule'
  inputs?: Formula[] //boolean
}

export function toJust(visual: VisualJustification, from?: number[]): Justification {
  switch (visual.category) {
    case 'assumption':
      return { kind: 'assumption', name: visual.name }
    case 'axiom':
      return {
        kind: 'axiom',
        schemaName: visual.name,
      }
    case 'rule':
      return {
        kind: 'rule',
        ruleName: visual.name,
        from: from ?? [],
      }
  }
}

/* export type Justification =
  | { kind: 'axiom'; schemaName: string }
  | { kind: 'rule'; ruleName: string; from: number[] }
  | { kind: 'assumption' }
   */
