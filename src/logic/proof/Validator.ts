import type { AxiomSchema } from '../rules/AxiomSchema'
import type { ProofError } from './ProofError'
import type { ProofState } from './ProofState'
import type { ProofStep } from './ProofStep'

import { matchAxiomSchema } from '../rules/AxiomSchema'
import { formulaEquals, type Formula } from '../syntax/Formula'
import { validateInferenceRule } from './RuleValidator'
import type { Assumption } from '../rules/AssumptionRegistry'

export interface ValidationResult {
  success: boolean
  error?: ProofError
}

// export class Validator {
export function validateStep(state: ProofState, step: ProofStep): ValidationResult {
  switch (step.justification.kind) {
    case 'axiom':
      return validateAxiom(step, state.axioms.getAll())

    case 'rule':
      const rule = state.rules.get(step.justification.ruleName)
      if (!rule) return { success: false, error: { code: 'unknown_rule' } }
      return validateInferenceRule(rule, state, step.justification.from, step.formula, step.index)

    case 'assumption':
      return validateAssumption(step, state.assumptions.getAll())

    default:
      return {
        success: false,
        error: { code: 'unknown_justification' },
      }
  }
  // }

  function validateAxiom(step: ProofStep, axioms: AxiomSchema[]): ValidationResult {
    if (step.justification.kind !== 'axiom') return { success: false }
    const schema = axioms.find(
      (a) => step.justification.kind === 'axiom' && a.name === step.justification.schemaName,
    )

    if (!schema) {
      return {
        success: false,
        error: { code: 'unknown_axiom_schema' },
      }
    }

    const result = matchAxiomSchema(schema.schema, step.formula)

    if (!result.success) {
      return {
        success: false,
        error: { code: 'axiom_mismatch' },
      }
    }

    return { success: true }
  }

  function validateAssumption(step: ProofStep, assumptions: Assumption[]): ValidationResult {
    if (step.justification.kind !== 'assumption') return { success: false }
    const formula = assumptions.find(
      (a) => step.justification.kind === 'assumption' && a.name === step.justification.name,
    )

    if (!formula) {
      return {
        success: false,
        error: { code: 'invalid_assumption' },
      }
    }

    const result = formulaEquals(formula.formula, step.formula)

    if (!result) {
      return {
        success: false,
        error: { code: 'assumption_mismatch' },
      }
    }

    return { success: true }
  }
}
