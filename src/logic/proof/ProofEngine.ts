import type { ProofError } from './ProofError'
import type { ProofState } from './ProofState'
import type { ProofStep } from './ProofStep'

import { validateStep } from './Validator'

export interface AddStepResult {
  success: boolean
  state?: ProofState
  error?: ProofError
}

export function addStep(
  state: ProofState,
  formula: ProofStep['formula'],
  justification: ProofStep['justification'],
): AddStepResult {
  const nextIndex = state.steps.length

  const newStep: ProofStep = {
    index: nextIndex,
    formula,
    justification,
  }

  const validation = validateStep(state, newStep)

  if (!validation.success) {
    return {
      success: false,
      error: validation.error,
    }
  }

  const newState: ProofState = {
    assumptions: state.assumptions,
    axioms: state.axioms,
    rules: state.rules,
    steps: [...state.steps, newStep],
  }

  return {
    success: true,
    state: newState,
  }
}
