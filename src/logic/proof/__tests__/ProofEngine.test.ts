import { describe, it, expect } from 'vitest'

import { emptyProofState, addStep } from '../ProofEngine'
import type { AxiomSchema } from '../../rules/AxiomSchema'

import { atom, imp } from '../../syntax/Formula'
import { createDefaultRuleRegistry } from '@/logic/rules/RuleRegistry'
import { Validator } from '../Validator'
import { createDefaultAxiomRegistry } from '@/logic/rules/AxiomRegistry'
import { parseFormula } from '@/helpers'

describe('ProofEngine - addStep', () => {
  const A = atom('A')
  const B = atom('B')
  const AB = imp(A, B)

  const axioms = createDefaultAxiomRegistry()
  const registry = createDefaultRuleRegistry()
  const validator = new Validator(axioms, registry)

  // axioms

  it('adds valid axiom step', () => {
    const state = emptyProofState()

    const result = addStep(state, imp(A, imp(B, A)), { kind: 'axiom', schemaName: 'H1' }, validator)

    expect(result.success).toBe(true)
    expect(result.state?.steps.length).toBe(1)
  })

  it('rejects invalid axiom step', () => {
    const state = emptyProofState()

    const result = addStep(state, imp(A, imp(B, B)), { kind: 'axiom', schemaName: 'H1' }, validator)

    expect(result.success).toBe(false)
    expect(result.state).toBeUndefined()
  })

  // assumptions

  it('allows inserting assumption', () => {
    const state = emptyProofState([A])

    const result = addStep(state, A, { kind: 'assumption' }, validator)

    expect(result.success).toBe(true)
  })

  it('rejects invalid assumption', () => {
    const state = emptyProofState([A])

    const result = addStep(state, B, { kind: 'assumption' }, validator)

    expect(result.success).toBe(false)
  })

  // Modus Ponens

  it('adds valid MP step', () => {
    const state0 = emptyProofState([A, AB])

    const r1 = addStep(state0, A, { kind: 'assumption' }, validator)

    const state1 = r1.state!

    const r2 = addStep(state1, AB, { kind: 'assumption' }, validator)

    const state2 = r2.state!

    const r3 = addStep(state2, B, { kind: 'rule', ruleName: 'MP', from: [0, 1] }, validator)

    expect(r3.success).toBe(true)
    expect(r3.state?.steps.length).toBe(3)
  })

  it('adds more complicated  MP step', () => {
    const state0 = emptyProofState()

    const r1 = addStep(
      state0,
      parseFormula('A>(B>A)'),
      { kind: 'axiom', schemaName: 'H1' },
      validator,
    )

    const state1 = r1.state!

    const r2 = addStep(
      state1,
      parseFormula('(A>(B>A))>((A>B)>(A>A))'),
      { kind: 'axiom', schemaName: 'H2' },
      validator,
    )

    const state2 = r2.state!

    const r3 = addStep(
      state2,
      imp(AB, imp(A, A)),
      { kind: 'rule', ruleName: 'MP', from: [0, 1] },
      validator,
    )

    expect(r3.success).toBe(true)
    expect(r3.state?.steps.length).toBe(3)
  })

  it('rejects invalid MP step', () => {
    const state0 = emptyProofState([A, AB])

    const r1 = addStep(state0, A, { kind: 'assumption' }, validator)

    const state1 = r1.state!

    const r2 = addStep(state1, AB, { kind: 'assumption' }, validator)

    const state2 = r2.state!

    const r3 = addStep(
      state2,
      A, // wrong conclusion
      { kind: 'rule', ruleName: 'MP', from: [0, 1] },
      validator,
    )

    expect(r3.success).toBe(false)
  })
})
