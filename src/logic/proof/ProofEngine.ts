import type { AppError } from './AppError'
import type { ProofState } from './ProofState'
import type { ProofStep } from './ProofStep'

import { validateStep } from './Validator'

export interface AddStepResult {
  success: boolean
  state?: ProofState
  error?: AppError
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

  const newState: ProofState = {
    ...state,
    steps: [...state.steps, newStep],
  }

  const validation = validateStep(newState, newStep)
  if (!validation.success) {
    return {
      success: false,
      error: validation.error!,
    }
  }

  return {
    success: true,
    state: newState,
  }
}
