import type { ProofState } from './ProofState'
import type { ProofStep } from './ProofStep'

export interface ValidationResult {
  valid: boolean
  error?: string
}

export function validateStep(state: ProofState, step: ProofStep): ValidationResult {
  return {
    valid: false,
    error: 'Validation not implemented',
  }
}
