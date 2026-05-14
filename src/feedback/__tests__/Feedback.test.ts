import { addStep } from '@/logic/proof/ProofEngine'
import { AxiomRegistry } from '@/logic/rules/AxiomRegistry'
import type { AxiomSchema } from '@/logic/rules/AxiomSchema'
import { RuleRegistry } from '@/logic/rules/RuleRegistry'
import { describe, expect, it } from 'vitest'
import { emptyProofState } from '../../logic/proof/ProofState'
import { atom, imp, not, parseFormula, type Formula } from '../../logic/syntax/Formula'
import {
  applyAxiomSchema,
  beamSearch,
  expandState,
  findMatches,
  getNextFromRules,
} from '../DeepSearch'
import { buildDerivedState } from '../DerivedState'
import { distance, evaluate } from '../HeuristicEvaluator'
import { analyze } from '../StepAnalyzer'

const A = atom('A')
const B = atom('B')
const C = atom('C')

describe('Feedback - basic methods', () => {
  it('findMatches with no results', () => {
    const state = emptyProofState(undefined, [A, B])
    const derived = buildDerivedState(state)

    const binding = findMatches(state.rules.get('MP')!, Array.from(derived.formulaMap.values()))

    // console.log(binding)
    expect(binding.length).toBe(0)
  })

  it('findMatches with one result', () => {
    const state = emptyProofState(undefined, [A, B])
    state.assumptions.add({ name: 'ABC', formula: imp(A, imp(B, C)) })
    const derived = buildDerivedState(state)

    const binding = findMatches(state.rules.get('MP')!, Array.from(derived.formulaMap.values()))

    // console.log(binding)
    expect(binding.length).toBe(1)
    expect(binding[0]!['?F']).toBe(A)
  })

  it('apply basic axiom schema', () => {
    const state = emptyProofState(undefined, [A, B])
    const derived = buildDerivedState(state)

    const applied = applyAxiomSchema(state.axioms.get('A1')!, derived)

    // console.log(applied)
    expect(applied.length).toBe(4)
  })

  it('getting next with large ruleset', () => {
    const state = emptyProofState(undefined, [A, B], true)
    state.assumptions.add({ name: 'ABC', formula: imp(A, imp(B, C)) })
    const derived = buildDerivedState(state)

    const binding = getNextFromRules(derived, state.rules)

    expect(binding.length).toBe(5)
    expect(binding).toContainEqual<Formula>(not(not(A)))
  })

  it('expanding state', () => {
    const state = emptyProofState(undefined, [A, B], true)
    const derived = buildDerivedState(state)

    const newState: Set<string> = new Set()
    const expanded = expandState(derived, state.rules, state.axioms)
    expanded.forEach((s) => s.formulas.forEach((f) => newState.add(f)))

    expect(newState.size).toBe(20)
    expect(newState).toContainEqual<string>('¬¬A')
  })

  it('basic beam search with A ⊢ A>A proof', () => {
    const state = emptyProofState(undefined, [A])
    const derived = buildDerivedState(state)
    derived.goal = imp(A, A)

    const result = beamSearch(derived, state.rules, state.axioms, evaluate, {
      maxDepth: 5,
      beamWidth: 3,
    })

    // console.log(result.bestScore)
    expect(result.bestDistance).toBe(0)
  })

  it('expanded beam search', () => {
    const state = emptyProofState(undefined, [A], true)
    const derived = buildDerivedState(state)
    derived.goal = imp(B, B)

    const result = beamSearch(derived, state.rules, state.axioms, evaluate, {
      maxDepth: 8,
      beamWidth: 3,
    })

    expect(result.bestDistance).toBeLessThan(Infinity)
  }, 10000)

  it('using rules with no inputs', () => {
    const state = emptyProofState()
    state.rules.add({ name: 'Test', premises: [], conclusion: imp(A, A) })
    const derived = buildDerivedState(state)
    derived.goal = imp(A, A)

    const result = beamSearch(derived, state.rules, state.axioms, evaluate, {
      maxDepth: 2,
      beamWidth: 5,
    })

    expect(result.foundGoal).toBeTruthy()
  })
})

/////////////////////////////////
//=============================//
/////////////////////////////////

describe('Feedback - more complicated proofs', () => {
  it('⊢ A>A proof', () => {
    const state = emptyProofState([])
    const derived = buildDerivedState(state)
    derived.goal = imp(A, A)

    const result = beamSearch(derived, state.rules, state.axioms, evaluate, {
      maxDepth: 15,
      beamWidth: 3,
    })

    // console.log(result.bestScore)
    expect(result.bestDistance).toBe(0)
  }, 15000)

  it('⊢ A>A analysis', () => {
    const state1 = emptyProofState()
    const state2 = addStep(state1, imp(A, imp(imp(A, A), A)), {
      kind: 'axiom',
      name: 'A1',
    }).state!

    const goal = imp(A, A)

    const result = analyze(state1, state2, goal)

    expect(result.kind).toBe('good')
    expect(result.score).toBe(4)
  })

  it('(A>B)>(-C>-B), B ⊢ C proof', () => {
    const hyp1 = imp(imp(atom('A'), atom('B')), imp(not(atom('C')), not(atom('B'))))
    const hyp2 = atom('B')
    const state1 = emptyProofState(undefined, [hyp1, hyp2], true)
    const derived = buildDerivedState(state1)
    derived.goal = atom('C')

    const result = beamSearch(derived, state1.rules, state1.axioms, evaluate, {
      maxDepth: 6,
      beamWidth: 5,
    })

    // expect(result.kind).toBe('good')
    expect(result.bestDistance).toBe(0)
  })

  it('impossible goal', () => {
    const state1 = emptyProofState(undefined, [atom('A')], true)
    const state2 = emptyProofState([
      {
        index: 0,
        formula: imp(A, imp(B, A)),
        justification: { kind: 'axiom', name: 'A1' },
      },
    ])
    const goal = imp(B, C)

    const result = analyze(state1, state2, goal)

    expect(result.kind).not.toBe('good')
  }, 30000)

  it('⊢ ¬X → (X → Y)', () => {
    const state = emptyProofState([
      {
        index: 0,
        formula: parseFormula('(¬B → ¬A) → (A → B)'),
        justification: { kind: 'axiom', name: 'A3' },
      },
      {
        index: 1,
        formula: parseFormula('((¬B → ¬A) → (A → B)) → (¬A → ((¬B → ¬A) → (A → B)))'),
        justification: { kind: 'axiom', name: 'A1' },
      },
      {
        index: 2,
        formula: parseFormula('¬A → ((¬B → ¬A) → (A → B))'),
        justification: { kind: 'axiom', name: 'A1' },
      },
    ])
    const derived = buildDerivedState(state)
    derived.goal = imp(not(A), imp(A, not(B)))

    const result = beamSearch(derived, state.rules, state.axioms, evaluate, {
      maxDepth: 5,
      beamWidth: 3,
    })

    expect(result.bestDistance).toBeLessThan(
      distance(parseFormula('(¬B → ¬A) → (A → B)'), derived.goal!),
    )
  }, 20000)
})
