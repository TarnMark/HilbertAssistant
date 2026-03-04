import { describe, it, expect } from 'vitest'

import type { ProofState } from '../ProofState'
import type { ProofStep } from '../ProofStep'

import { parseFormula } from '@/helpers'

import { atom, formulaToString, imp } from '@/logic/syntax/Formula'
import { createDefaultRuleRegistry } from '@/logic/rules/RuleRegistry'
import { createDefaultAxiomRegistry } from '@/logic/rules/AxiomRegistry'
import { Validator } from '../Validator'

// Helper: empty proof state
function makeState(steps: ProofStep[]): ProofState {
  return { assumptions: [], steps }
}

describe('ProofValidator', () => {
  const A = atom('A')
  const B = atom('B')

  const axioms = createDefaultAxiomRegistry()
  const registry = createDefaultRuleRegistry()
  const validator = new Validator(axioms, registry)

  it('accepts valid axiom instance', () => {
    const step: ProofStep = {
      index: 0,
      formula: imp(A, imp(B, A)),
      // formula: parseFormula('A > (B > A)'),
      justification: { kind: 'axiom', schemaName: 'H1' },
    }

    const state = makeState([])

    console.log(formulaToString(step.formula))
    const result = validator.validateStep(state, step)

    expect(result.success).toBe(true)
  })

  it('rejects invalid axiom instance', () => {
    const step: ProofStep = {
      index: 0,
      formula: imp(A, imp(B, B)), // wrong final atom
      justification: { kind: 'axiom', schemaName: 'H1' },
    }

    const state = makeState([])

    const result = validator.validateStep(state, step)

    expect(result.success).toBe(false)
  })

  it('accepts valid Modus Ponens', () => {
    const step0: ProofStep = {
      index: 0,
      formula: A,
      justification: { kind: 'assumption' },
    }

    const step1: ProofStep = {
      index: 1,
      formula: imp(A, B),
      justification: { kind: 'assumption' },
    }

    const step2: ProofStep = {
      index: 2,
      formula: B,
      justification: { kind: 'rule', ruleName: 'MP', from: [0, 1] },
    }

    const state = makeState([step0, step1])

    const result = validator.validateStep(state, step2)

    expect(result.success).toBe(true)
  })

  it('rejects MP when antecedent does not match', () => {
    const step0: ProofStep = {
      index: 0,
      formula: B,
      justification: { kind: 'axiom', schemaName: 'H1' },
    }

    const step1: ProofStep = {
      index: 1,
      formula: imp(A, B),
      justification: { kind: 'axiom', schemaName: 'H1' },
    }

    const step2: ProofStep = {
      index: 2,
      formula: B,
      justification: { kind: 'rule', ruleName: 'MP', from: [0, 1] },
    }

    const state = makeState([step0, step1])

    const result = validator.validateStep(state, step2)

    expect(result.success).toBe(false)
  })

  it('rejects MP referencing future step', () => {
    const step0: ProofStep = {
      index: 0,
      formula: A,
      justification: { kind: 'axiom', schemaName: 'H1' },
    }

    const step1: ProofStep = {
      index: 1,
      formula: B,
      justification: { kind: 'rule', ruleName: 'MP', from: [0, 2] },
    }

    const state = makeState([step0])

    const result = validator.validateStep(state, step1)

    expect(result.success).toBe(false)
  })

  it('rejects MP when second line is not implication', () => {
    const step0: ProofStep = {
      index: 0,
      formula: A,
      justification: { kind: 'axiom', schemaName: 'H1' },
    }

    const step1: ProofStep = {
      index: 1,
      formula: B,
      justification: { kind: 'axiom', schemaName: 'H1' },
    }

    const step2: ProofStep = {
      index: 2,
      formula: B,
      justification: { kind: 'rule', ruleName: 'MP', from: [0, 1] },
    }

    const state = makeState([step0, step1])

    const result = validator.validateStep(state, step2)

    expect(result.success).toBe(false)
  })
})
