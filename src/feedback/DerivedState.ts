import type { ProofState } from '../logic/proof/ProofState'
import {
  collectSubformulas,
  formulaToString,
  normalizeFormula,
  type Formula,
} from '../logic/syntax/Formula'

export interface DerivedState {
  formulas: Set<string> // canonicalized formulas
  formulaMap: Map<string, Formula> // reverse lookup if needed
  goal?: Formula
}

export function buildDerivedState(state: ProofState): DerivedState {
  const formulas = new Set<string>()
  const formulaMap = new Map<string, Formula>()

  const add = (f: Formula) => {
    const key = formulaToString(normalizeFormula(f))
    formulas.add(key)
    formulaMap.set(key, f)
  }

  state.assumptions.getAll().forEach((a) => add(a.formula))

  state.steps.forEach((step) => add(step.formula))

  return { formulas, formulaMap }
}

export function buildSubformulaSet(state: DerivedState): Formula[] {
  const acc = new Map<string, Formula>()

  for (const f of state.formulaMap.values()) {
    collectSubformulas(f, acc)
  }

  if (state.goal) collectSubformulas(state.goal, acc)

  return Array.from(acc.values())
}
