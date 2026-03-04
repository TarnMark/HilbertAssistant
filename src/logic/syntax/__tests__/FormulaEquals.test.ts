import { describe, it, expect } from 'vitest'
import { atom, formulaEquals, imp, not } from '../Formula'

describe('formulaEquals (propositional)', () => {
  it('identifies identical atoms', () => {
    expect(formulaEquals(atom('A'), atom('A'))).toBe(true)
  })

  it('distinguishes different atoms', () => {
    expect(formulaEquals(atom('A'), atom('B'))).toBe(false)
  })

  it('identifies identical implications', () => {
    const f1 = imp(atom('A'), atom('B'))
    const f2 = imp(atom('A'), atom('B'))

    expect(formulaEquals(f1, f2)).toBe(true)
  })

  it('distinguishes implication direction', () => {
    const f1 = imp(atom('A'), atom('B'))
    const f2 = imp(atom('B'), atom('A'))

    expect(formulaEquals(f1, f2)).toBe(false)
  })

  it('handles nested implications', () => {
    const f1 = imp(atom('A'), imp(atom('B'), atom('A')))
    const f2 = imp(atom('A'), imp(atom('B'), atom('A')))

    expect(formulaEquals(f1, f2)).toBe(true)
  })

  it('handles negation', () => {
    const f1 = not(atom('A'))
    const f2 = not(atom('A'))

    expect(formulaEquals(f1, f2)).toBe(true)
  })

  it('distinguishes negation depth', () => {
    const f1 = not(not(atom('A')))
    const f2 = not(atom('A'))

    expect(formulaEquals(f1, f2)).toBe(false)
  })

  it('distinguishes negation vs implication', () => {
    const f1 = not(atom('A'))
    const f2 = imp(atom('A'), atom('A'))

    expect(formulaEquals(f1, f2)).toBe(false)
  })
})
