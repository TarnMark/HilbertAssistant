import type { ProofState } from './ProofState'
import type { ProofStep } from './ProofStep'
import type { AxiomSchema } from '../rules/AxiomSchema'
import type { ProofError } from './ProofError'

import { matchAxiomSchema } from '../rules/AxiomSchema'
import { validateInferenceRule } from './RuleValidator'
import type { RuleRegistry } from '../rules/RuleRegistry'
import type { AxiomRegistry } from '../rules/AxiomRegistry'
import { formulaEquals } from '../syntax/Formula'

export interface ValidationResult {
  success: boolean
  error?: ProofError
}

export class Validator {
  constructor(
    private axioms: AxiomRegistry,
    private rules: RuleRegistry,
  ) {}

  validateStep(state: ProofState, step: ProofStep): ValidationResult {
    switch (step.justification.kind) {
      case 'axiom':
        return this.validateAxiom(step, this.axioms.getAll())

      case 'rule':
        const rule = this.rules.get(step.justification.ruleName)
        if (!rule) return { success: false, error: { code: 'unknown_rule' } }
        return validateInferenceRule(rule, state, step.justification.from, step.formula, step.index)

      case 'assumption':
        return this.validateAssumption(state, step)

      default:
        return {
          success: false,
          error: { code: 'unknown_justification' },
        }
    }
  }

  validateAxiom(step: ProofStep, axioms: AxiomSchema[]): ValidationResult {
    const schema = axioms.find((a) => a.name === step.justification.schemaName)

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

  validateAssumption(state: ProofState, step: ProofStep): ValidationResult {
    const exists = state.assumptions.some((a) => formulaEquals(a, step.formula))

    if (!exists) {
      return {
        success: false,
        error: { code: 'invalid_assumption' },
      }
    }

    return { success: true }
  }
}
