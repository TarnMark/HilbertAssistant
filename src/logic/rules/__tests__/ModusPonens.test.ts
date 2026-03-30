import { describe, it, expect } from 'vitest'
import { atom, imp, not } from '../../syntax/Formula'
import { createDefaultAxiomRegistry } from '../AxiomRegistry'
import { createDefaultRuleRegistry } from '../RuleRegistry'
import { emptyProofState } from '@/logic/proof/ProofState'
import type { ProofStep } from '@/logic/proof/ProofStep'
import type { ProofState } from '@/logic/proof/ProofState'
import { validateStep } from '@/logic/proof/Validator'

describe('Modus Ponens', () => {
  const A = atom('A')
  const B = atom('B')
  const C = atom('C')

  const state = emptyProofState()

  it('accepts valid Modus Ponens', () => {
    const step0: ProofStep = {
      index: 0,
      formula: A,
      justification: { kind: 'assumption', name: 'H1' },
    }

    const step1: ProofStep = {
      index: 1,
      formula: imp(A, B),
      justification: { kind: 'assumption', name: 'H2' },
    }

    const step2: ProofStep = {
      index: 2,
      formula: B,
      justification: { kind: 'rule', ruleName: 'MP', from: [0, 1] },
    }

    const state = emptyProofState([step0, step1])

    const result = validateStep(state, step2)

    expect(result.success).toBe(true)
  })

  it('rejects MP when antecedent does not match', () => {
    const step0: ProofStep = {
      index: 0,
      formula: B,
      justification: { kind: 'assumption', name: 'A1' },
    }

    const step1: ProofStep = {
      index: 1,
      formula: imp(A, B),
      justification: { kind: 'assumption', name: 'A2' },
    }

    const step2: ProofStep = {
      index: 2,
      formula: B,
      justification: { kind: 'rule', ruleName: 'MP', from: [0, 1] },
    }

    const state = emptyProofState([step0, step1])

    const result = validateStep(state, step2)

    expect(result.success).toBe(false)
  })

  it('rejects MP referencing future step', () => {
    const step0: ProofStep = {
      index: 0,
      formula: A,
      justification: { kind: 'assumption', name: 'A1' },
    }

    const step1: ProofStep = {
      index: 1,
      formula: B,
      justification: { kind: 'rule', ruleName: 'MP', from: [0, 2] },
    }

    const state = emptyProofState([step0])

    const result = validateStep(state, step1)

    expect(result.success).toBe(false)
  })

  it('rejects MP when second line is not implication', () => {
    const step0: ProofStep = {
      index: 0,
      formula: A,
      justification: { kind: 'assumption', name: 'A1' },
    }

    const step1: ProofStep = {
      index: 1,
      formula: B,
      justification: { kind: 'assumption', name: 'A2' },
    }

    const step2: ProofStep = {
      index: 2,
      formula: B,
      justification: { kind: 'rule', ruleName: 'MP', from: [0, 1] },
    }

    const state = emptyProofState([step0, step1])

    const result = validateStep(state, step2)

    expect(result.success).toBe(false)
  })

  it('MP handles nested formulas', () => {
    const antecedent = imp(A, B)
    const implication = imp(antecedent, C)

    const step0: ProofStep = {
      index: 0,
      formula: antecedent,
      justification: { kind: 'assumption', name: 'A1' },
    }

    const step1: ProofStep = {
      index: 1,
      formula: implication,
      justification: { kind: 'assumption', name: 'A2' },
    }

    const step2: ProofStep = {
      index: 2,
      formula: C,
      justification: { kind: 'rule', ruleName: 'MP', from: [0, 1] },
    }

    const state = emptyProofState([step0, step1])

    const result = validateStep(state, step2)

    expect(result.success).toBe(true)
  })

  it('distinguishes syntactically different antecedents', () => {
    const step0: ProofStep = {
      index: 0,
      formula: not(A),
      justification: { kind: 'assumption', name: 'A1' },
    }

    const step1: ProofStep = {
      index: 1,
      formula: imp(A, B),
      justification: { kind: 'assumption', name: 'A2' },
    }

    const step2: ProofStep = {
      index: 2,
      formula: B,
      justification: { kind: 'rule', ruleName: 'MP', from: [0, 1] },
    }

    const state = emptyProofState([step0, step1])

    const result = validateStep(state, step2)

    expect(result.success).toBe(false)
  })
})
