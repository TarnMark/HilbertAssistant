import type { ProofState } from '../proof/ProofState'
import { type Formula } from '../syntax/Formula'
import { beamSearch } from './DeepSearch'
import { buildDerivedState, type DerivedState } from './DerivedState'
import { evaluate } from './HeuristicEvaluator'

export type StepFeedback = {
  kind: 'good' | 'neutral' | 'bad'
  message: string
  score: number
}

const options = {
  maxDepth: 5,
  beamWidth: 3,
}

const buffer = 0

let score = 100

const GOOD: (msg?: string) => StepFeedback = (msg?: string) => {
  return { kind: 'good', message: msg ?? 'feedback.hints.feedback.good.default', score }
}
const NEUTRAL: (msg?: string) => StepFeedback = (msg?: string) => {
  return {
    kind: 'neutral',
    message: msg ?? 'feedback.hints.feedback.neutral.default',
    score,
  }
}
const BAD: (msg?: string) => StepFeedback = (msg?: string) => {
  return { kind: 'bad', message: msg ?? 'feedback.hints.feedback.bad', score }
}

export function analyze(
  prevState: ProofState,
  nextState: ProofState,
  goal: Formula,
  heuristicEval: (s: DerivedState) => number = evaluate,
): StepFeedback {
  const prevDerived = buildDerivedState(prevState)
  const nextDerived = buildDerivedState(nextState)
  prevDerived.goal = goal
  nextDerived.goal = goal

  if (prevDerived.formulas.size === nextDerived.formulas.size)
    return NEUTRAL('feedback.hints.feedback.neutral.no_goal')

  const rules = prevState.rules
  const axioms = prevState.axioms

  const prevSearch = beamSearch(prevDerived, rules, axioms, heuristicEval, options)
  const nextSearch = beamSearch(nextDerived, rules, axioms, heuristicEval, options)

  score = nextSearch.foundGoal ? nextSearch.minDepthToGoal! : nextSearch.bestDistance

  // both states have reached the goal
  if (prevSearch.minDepthToGoal !== null && nextSearch.minDepthToGoal !== null) {
    if (nextSearch.minDepthToGoal === 0) {
      return GOOD('feedback.hints.achieved')
    }
    if (nextSearch.minDepthToGoal < prevSearch.minDepthToGoal) {
      return GOOD()
    } else if (nextSearch.minDepthToGoal === prevSearch.minDepthToGoal) {
      return NEUTRAL()
    } else {
      return BAD()
    }
  }

  // only one state has reached the goal
  if (nextSearch.foundGoal && !prevSearch.foundGoal) {
    return GOOD('feedback.hints.feedback.good.goal')
  }
  if (!nextSearch.foundGoal && prevSearch.foundGoal) {
    return BAD()
  }

  const difference = prevSearch.bestDistance - nextSearch.bestDistance
  // goal was not reached - default score comparison
  if (difference > buffer) {
    return GOOD('feedback.hints.feedback.good.no_goal')
  }
  if (difference <= buffer && difference >= -buffer) {
    return NEUTRAL('feedback.hints.feedback.neutral.no_goal')
  }
  return BAD()
}

export function analyzeMaxProgress(
  state: ProofState,
  goal: Formula,
  heuristicEval: (s: DerivedState) => number = evaluate,
): number {
  const derived = buildDerivedState(state)
  derived.goal = goal
  const result = beamSearch(derived, state.rules, state.axioms, heuristicEval, options)

  return result.foundGoal ? result.minDepthToGoal! : result.bestDistance
}
// }
