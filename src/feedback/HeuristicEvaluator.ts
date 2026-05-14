import {
  formulaEquals,
  formulaToString,
  normalizeFormula,
  type Atom,
  type Formula,
  type Implication,
  type Negation,
} from '../logic/syntax/Formula'
import type { DerivedState } from './DerivedState'

export function evaluate(state: DerivedState): number {
  const goalNorm = normalizeFormula(state.goal!)

  if (state.formulas.has(formulaToString(goalNorm))) return 0

  let best = Infinity

  for (const f of state.formulaMap.values()) {
    const d = distance(f, goalNorm)
    best = Math.min(best, d)
  }

  const formula = Array.from(state.formulaMap.values())[state.formulas.size - 1]

  if (!formula) return 0

  let score = 100

  score += best // + 0.3 * avg
  // score += 0.2 * distance(formula, goalNorm)

  // Complexity (soft penalty)
  score += averageFormulaSize(state)

  // Potential
  score -= 2 * mpPotential(state)

  score += tautology(state)

  return Math.round(score)
}

export function distance(a: Formula, b: Formula): number {
  if (formulaEquals(a, b)) return 0

  if (a.kind === b.kind) {
    switch (a.kind) {
      case 'atom':
        return a.name === (b as Atom).name ? 0 : 2

      case 'not':
        return 1 + distance(a.inner, (b as Negation).inner)

      case 'imp': {
        const bb = b as Implication
        return 1 + distance(a.left, bb.left) + distance(a.right, bb.right)
      }
    }
  }

  return 2 + structuralSize(a) + structuralSize(b)
}

function structuralSize(f: Formula): number {
  switch (f.kind) {
    case 'atom':
      return 1
    case 'not':
      return 5 + structuralSize(f.inner)
    case 'imp':
      return 1 + structuralSize(f.left) + structuralSize(f.right)
  }
}

export function averageFormulaSize(state: DerivedState): number {
  const formulas = Array.from(state.formulaMap.values())

  if (formulas.length === 0) return 0

  let total = 0

  for (const f of formulas) {
    total += structuralSize(f)
  }

  return total / formulas.length
}

function mpPotential(state: DerivedState): number {
  let score = 0
  const goal = formulaToString(state.goal!)
  const formulas = Array.from(state.formulaMap.values())

  // for (const f of formulas) {
  const f = formulas[formulas.length - 1]
  if (!f || f.kind !== 'imp') return 0 //continue

  const left = formulaToString(f.left)
  const right = formulaToString(f.right)

  if (state.formulas.has(left)) {
    score += 4
  }
  if (right === goal) {
    score += 5
  }
  if (left === goal) {
    score -= 3
  }

  if (f.right.kind === 'imp') {
    const impleft = formulaToString(normalizeFormula(f.right.left))
    const impright = formulaToString(normalizeFormula(f.right.right))

    if (state.formulas.has(impleft)) {
      score += 3
    }
    if (impleft === goal) {
      score -= 3
    }
    if (impright === goal) {
      score += 5
    }
    if (left === impleft && left === impright && goal !== right) {
      score -= 15
    }
  }
  // }

  return score
}

function tautology(state: DerivedState): number {
  let score = 0
  const goalVars = atoms(state.goal!)
  const formula = Array.from(state.formulaMap.values())[state.formulas.size - 1]

  if (!formula) return 0

  const arr = atoms(formula)
  for (const a of arr) {
    if (!goalVars.includes(a)) score += 1
  }

  if (new Set(arr).size === 1 && !goalVars.includes(arr[0]!)) score *= 2

  return score
}

function atoms(f: Formula, acc: string[] = []): string[] {
  switch (f.kind) {
    case 'atom': {
      acc.push(f.name)
      return acc
    }
    case 'not': {
      if (f.inner.kind === 'atom') {
        acc.push(formulaToString(f))
        return acc
      }
      atoms(f.inner, acc)
      return acc
    }
    case 'imp': {
      atoms(f.left, acc)
      atoms(f.right, acc)
      return acc
    }
  }
}
