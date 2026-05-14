import type { AxiomSchema } from '../rules/AxiomSchema'
import { AppError } from './AppError'
import type { ProofState } from './ProofState'
import type { ProofStep } from './ProofStep'

import { matchAxiomSchema } from '../rules/AxiomSchema'
import { formulaEquals, type Formula } from '../syntax/Formula'
import { validateInferenceRule } from './RuleValidator'
import type { Assumption } from '../rules/AssumptionRegistry'

export interface ValidationResult {
  success: boolean
  error?: AppError
}

// export class Validator {
export function validateStep(state: ProofState, step: ProofStep): ValidationResult {
  switch (step.justification.kind) {
    case 'axiom':
      return validateAxiom(step, state.axioms.getAll())

    case 'rule':
      const name = step.justification.name
      const rule = state.rules.get(name)
      if (!rule)
        return {
          success: false,
          error: new AppError('feedback.errors.validation.unknown_rule', { name }),
        }
      return validateInferenceRule(rule, state, step.justification.from, step.formula, step.index)

    case 'assumption':
      return validateAssumption(step, state.assumptions.getAll())

    default:
      return {
        success: false,
        error: new AppError('feedback.errors.validation.unknown_justification'),
      }
  }
  // }

  function validateAxiom(step: ProofStep, axioms: AxiomSchema[]): ValidationResult {
    if (step.justification.kind !== 'axiom') return { success: false }
    const name = step.justification.name
    const schema = axioms.find((a) => step.justification.kind === 'axiom' && a.name === name)

    if (!schema) {
      return {
        success: false,
        error: new AppError('feedback.errors.validation.unknown_axiom', { name }),
      }
    }

    const result = matchAxiomSchema(schema.schema, step.formula)

    if (!result.success) {
      return {
        success: false,
        error: new AppError('feedback.errors.validation.axiom_mismatch'),
      }
    }

    return { success: true }
  }

  function validateAssumption(step: ProofStep, assumptions: Assumption[]): ValidationResult {
    if (step.justification.kind !== 'assumption') return { success: false }
    const name = step.justification.name
    const formula = assumptions.find(
      (a) => step.justification.kind === 'assumption' && a.name === name,
    )

    if (!formula) {
      return {
        success: false,
        error: new AppError('feedback.errors.validation.unknown_assumption', { name }),
      }
    }

    const result = formulaEquals(formula.formula, step.formula)

    if (!result) {
      return {
        success: false,
        error: new AppError('feedback.errors.validation.assumption_mismatch'),
      }
    }

    return { success: true }
  }
}
