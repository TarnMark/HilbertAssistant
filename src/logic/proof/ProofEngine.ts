import type { ProofState } from './ProofState'
import type { ProofStep } from './ProofStep'
import type { ProofError } from './ProofError'
import type { AxiomSchema } from '../rules/AxiomSchema'

import type { Formula } from '../syntax/Formula'
import type { Validator } from './Validator'

export interface AddStepResult {
  success: boolean
  state?: ProofState
  error?: ProofError
}

export function emptyProofState(assumptions: Formula[] = []): ProofState {
  return { assumptions, steps: [] }
}

export function addStep(
  state: ProofState,
  formula: ProofStep['formula'],
  justification: ProofStep['justification'],
  validator: Validator,
): AddStepResult {
  const nextIndex = state.steps.length

  const newStep: ProofStep = {
    index: nextIndex,
    formula,
    justification,
  }

  const validation = validator.validateStep(state, newStep)

  if (!validation.success) {
    return {
      success: false,
      error: validation.error,
    }
  }

  const newState: ProofState = {
    assumptions: state.assumptions,
    steps: [...state.steps, newStep],
  }

  return {
    success: true,
    state: newState,
  }
}
