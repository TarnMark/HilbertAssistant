import { describe, it, expect } from 'vitest'
import { matchAxiomSchema } from '../AxiomSchema'
import { atom, imp, not } from '@/logic/syntax/Formula'

describe('Axiom schema matching', () => {
  it('matches simple schema A → (B → A)', () => {
    const schema = imp(atom('?A'), imp(atom('?B'), atom('?A')))

    const instance = imp(atom('P'), imp(atom('Q'), atom('P')))

    const result = matchAxiomSchema(schema, instance)

    expect(result.success).toBe(true)
    expect(result.bindings?.get('?A')).toEqual(atom('P'))
    expect(result.bindings?.get('?B')).toEqual(atom('Q'))
  })

  it('fails if repeated schema variable binds inconsistently', () => {
    const schema = imp(atom('?A'), imp(atom('?B'), atom('?A')))

    const instance = imp(atom('P'), imp(atom('Q'), atom('R')))

    const result = matchAxiomSchema(schema, instance)

    expect(result.success).toBe(false)
  })

  it('matches nested formulas as schema variables', () => {
    const schema = imp(atom('?A'), atom('?B'))

    const instance = imp(imp(atom('P'), atom('Q')), not(atom('R')))

    const result = matchAxiomSchema(schema, instance)

    expect(result.success).toBe(true)
  })

  it('fails on structural mismatch', () => {
    const schema = imp(atom('?A'), atom('?B'))
    const instance = not(atom('P'))

    const result = matchAxiomSchema(schema, instance)

    expect(result.success).toBe(false)
  })
})
