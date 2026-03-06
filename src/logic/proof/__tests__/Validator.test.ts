import { describe, expect, it } from 'vitest'

import type { ProofStep } from '../ProofStep'

import { atom, formulaToString, imp } from '@/logic/syntax/Formula'
import { validateStep } from '../Validator'
import { emptyProofState } from '../ProofState'

describe('ProofValidator', () => {
  const A = atom('A')
  const B = atom('B')

  it('accepts valid axiom instance', () => {
    const step: ProofStep = {
      index: 0,
      formula: imp(A, imp(B, A)),
      // formula: parseFormula('A > (B > A)'),
      justification: { kind: 'axiom', schemaName: 'H1' },
    }

    const state = emptyProofState()

    console.log(formulaToString(step.formula))
    const result = validateStep(state, step)

    expect(result.success).toBe(true)
  })

  it('rejects invalid axiom instance', () => {
    const step: ProofStep = {
      index: 0,
      formula: imp(A, imp(B, B)), // wrong final atom
      justification: { kind: 'axiom', schemaName: 'H1' },
    }

    const state = emptyProofState()

    const result = validateStep(state, step)

    expect(result.success).toBe(false)
  })
})
