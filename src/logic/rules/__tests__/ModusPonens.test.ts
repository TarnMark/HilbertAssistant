import { describe, it, expect } from 'vitest'
import { atom, imp, not } from '../../syntax/Formula'
import { createDefaultAxiomRegistry } from '../AxiomRegistry'
import { createDefaultRuleRegistry } from '../RuleRegistry'
import { Validator } from '@/logic/proof/Validator'
import { emptyProofState } from '@/logic/proof/ProofEngine'

describe('Modus Ponens (propositional)', () => {
  const A = atom('A')
  const B = atom('B')
  const C = atom('C')

  const axioms = createDefaultAxiomRegistry()
  const registry = createDefaultRuleRegistry()
  const validator = new Validator(axioms, registry)

  const state = emptyProofState()

  it.todo('derives consequent when antecedent matches', () => {
    const result = validator.validateStep(state, A, imp(A, B))

    expect(result.success).toBe(true)
    expect(result.derived).toEqual(B)
  })

  it.todo('fails when second premise is not an implication', () => {
    const result = applyModusPonens(A, B)

    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })

  it.todo('fails when antecedent does not match implication', () => {
    const result = applyModusPonens(A, imp(B, C))

    expect(result.success).toBe(false)
  })

  it.todo('handles nested formulas', () => {
    const antecedent = imp(A, B)
    const implication = imp(antecedent, C)

    const result = applyModusPonens(antecedent, implication)

    expect(result.success).toBe(true)
    expect(result.derived).toEqual(C)
  })

  it.todo('distinguishes syntactically different antecedents', () => {
    const result = applyModusPonens(not(A), imp(A, B))

    expect(result.success).toBe(false)
  })
})
