import { instantiate } from '../logic/proof/RuleValidator'
import { AxiomRegistry } from '../logic/rules/AxiomRegistry'
import type { AxiomSchema } from '../logic/rules/AxiomSchema'
import { matchWithBindings, type InferenceRule } from '../logic/rules/InferenceRule'
import { RuleRegistry } from '../logic/rules/RuleRegistry'
import { formulaToString, normalizeFormula, type Formula } from '../logic/syntax/Formula'
import { buildSubformulaSet, type DerivedState } from './DerivedState'
import { distance } from './HeuristicEvaluator'

export type Binding = Record<string, Formula>

export interface SearchNode {
  state: DerivedState
  score: number
  depth: number
}

export function findMatches(rule: InferenceRule | AxiomSchema, candidates: Formula[]): Binding[] {
  const premises = rule.premises!

  if (!premises || premises.length === 0) return []

  const results: Binding[] = []

  function backtrack(premiseIndex: number, currentBindings: Binding) {
    if (premiseIndex === premises.length) {
      results.push({ ...currentBindings })
      return
    }

    const pattern = premises[premiseIndex]!

    for (const candidate of candidates) {
      const newBindings = { ...currentBindings }

      const match = matchWithBindings(pattern, candidate, newBindings)

      if (match) {
        backtrack(premiseIndex + 1, match)
      }
    }
  }

  backtrack(0, {})
  return results
}

export function applyRule(rule: InferenceRule, state: DerivedState): Formula[] {
  const candidates = Array.from(state.formulaMap.values())
  const results: Formula[] = []

  const matches = findMatches(rule, candidates)

  for (const binding of matches) {
    const instantiated = instantiate(rule.conclusion, binding)
    results.push(instantiated)
  }

  return results
}

export function getNextFromRules(state: DerivedState, rules: RuleRegistry): Formula[] {
  const results: Formula[] = []
  const seen = new Set<string>(state.formulas)

  for (const rule of rules.getAll()) {
    if (rule.premises.length === 0) continue

    const derived = applyRule(rule, state)

    for (const f of derived) {
      const norm = normalizeFormula(f)
      const key = formulaToString(norm)

      if (!seen.has(key)) {
        seen.add(key)
        results.push(norm)
      }
    }
  }
  return results
}

export function applyAxiomSchema(schema: AxiomSchema, state: DerivedState): Formula[] {
  const candidates = buildSubformulaSet(state)
  const results: Formula[] = []

  const matches = findMatches(schema, candidates)

  for (const binding of matches) {
    const instantiated = instantiate(schema.schema, binding, true)
    results.push(instantiated)
  }

  return results
}

export function getNextFromAxioms(state: DerivedState, axioms: AxiomRegistry): Formula[] {
  const results: Formula[] = []
  const seen = new Set<string>(state.formulas)

  for (const axiom of axioms.getAll()) {
    if (axiom.premises?.length === 0) continue

    const derived = applyAxiomSchema(axiom, state)

    for (const f of derived) {
      const norm = normalizeFormula(f)
      const key = formulaToString(norm)

      if (!seen.has(key)) {
        seen.add(key)
        results.push(norm)
      }
    }
  }

  return results
}

export function expandState(
  state: DerivedState,
  rules: RuleRegistry,
  axioms: AxiomRegistry,
): DerivedState[] {
  const nextFormulas = getNextFromRules(state, rules).concat(getNextFromAxioms(state, axioms))
  const results: DerivedState[] = []

  for (const f of nextFormulas) {
    const newSet = new Set(state.formulas)
    const newMap = new Map(state.formulaMap)

    const key = formulaToString(f)

    newSet.add(key)
    newMap.set(key, f)

    results.push({
      formulas: newSet,
      formulaMap: newMap,
    })
  }

  return results
}

export interface SearchOptions {
  maxDepth: number
  beamWidth: number
}

export interface SearchResult {
  bestDistance: number
  foundGoal: boolean
  minDepthToGoal: number | null
}

export function beamSearch(
  initial: DerivedState,
  rules: RuleRegistry,
  axioms: AxiomRegistry,
  heuristic: (s: DerivedState) => number,
  options: SearchOptions,
): SearchResult {
  let frontier: SearchNode[] = [
    {
      state: initial,
      score: heuristic(initial),
      depth: 0,
    },
  ]

  const news = filterRulesWithoutPremises(rules, axioms)
  const newRules = news.newRules
  const newAxioms = news.newAxioms

  options.maxDepth += initial.formulas.size
  const goalKey = formulaToString(normalizeFormula(initial.goal!))

  for (let depth = 0; depth < options.maxDepth; depth++) {
    const nextFrontier: SearchNode[] = []

    for (const node of frontier) {
      if (node.state.formulas.has(goalKey)) {
        return {
          bestDistance: 0,
          foundGoal: true,
          minDepthToGoal: node.depth,
        }
      }

      const expanded = expandState(node.state, newRules, newAxioms)

      for (const newState of expanded) {
        newState.goal = initial.goal
        const score = heuristic(newState)

        nextFrontier.push({
          state: newState,
          score,
          depth: node.depth + 1,
        })
      }
    }

    // Sort by heuristic (lower = better)
    nextFrontier.sort((a, b) => a.score - b.score)

    // Beam pruning
    frontier = nextFrontier.slice(0, options.beamWidth)

    if (frontier.length === 0) break
  }

  // frontier[0]?.state.formulas.forEach((a) => console.log(a))
  const bestScore = frontier.length > 0 ? Math.min(...frontier.map((n) => n.score)) : Infinity

  return {
    bestDistance: bestDistanceToGoal(frontier[0]?.state!),
    foundGoal: false,
    minDepthToGoal: null,
  }
}

export function bestDistanceToGoal(state: DerivedState): number {
  let best = Infinity

  for (const f of state.formulaMap.values()) {
    const d = distance(f, state.goal!)
    if (d < best) best = d
  }

  return best
}

function filterRulesWithoutPremises(rules: RuleRegistry, axioms: AxiomRegistry) {
  const newRules = RuleRegistry.from(...rules.getAll().filter((r) => r.premises.length > 0))

  const rulesWithNoInputs = rules.getAll().filter((r) => r.premises.length === 0)
  const newAxioms = AxiomRegistry.from(
    ...axioms
      .getAll()
      .concat(
        rulesWithNoInputs.map(
          (r) => ({ name: r.name + '_AsAxiom', schema: r.conclusion }) as AxiomSchema,
        ),
      ),
  )

  return { newRules, newAxioms }
}
