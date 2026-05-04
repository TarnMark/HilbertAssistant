import type { ProofState } from '../proof/ProofState'
import type { InferenceRule } from '../rules/InferenceRule'
import { isSchemaVariable, matchWithBindings } from '../rules/InferenceRule'
import { atom, formulaEquals, imp, not, type Atom, type Formula } from '../syntax/Formula'
import { AppError } from './AppError'

export function validateInferenceRule(
  rule: InferenceRule,
  state: ProofState,
  premiseIndices: number[],
  conclusion: Formula,
  stepIndex: number,
) {
  if (premiseIndices.length !== rule.premises.length) {
    return { success: false }
  }

  const bindings: Record<string, Formula> = {}

  if (rule.premises.length === 0) {
    const ok = matchWithBindings(rule.conclusion, conclusion, bindings)

    if (!ok)
      return { success: false, error: new AppError('feedback.errors.validation.rule_mismatch') }
  } else {
    for (let k = 0; k < rule.premises.length; k++) {
      const index = premiseIndices[k]!

      // checks if the referenced step is from the future
      if (index >= stepIndex) {
        return { success: false }
      }

      const step = state.steps[index]
      if (!step) {
        return { success: false }
      }

      const ok = matchWithBindings(rule.premises[k]!, step.formula, bindings)

      if (!ok) {
        return { success: false, error: new AppError('feedback.errors.validation.rule_mismatch') }
      }
    }
  }
  // instantiate conclusion
  const instantiated = instantiate(rule.conclusion, bindings)

  if (!formulaEquals(instantiated, conclusion)) {
    return { success: false, error: new AppError('feedback.errors.validation.rule_mismatch') }
  }

  return { success: true }
}

export function instantiate(
  pattern: Formula,
  bindings: Record<string, Formula>,
  ignoreUnbound = false,
): Formula {
  if (isSchemaVariable(pattern)) {
    pattern = pattern as Atom
    const name = pattern.name
    let bound = bindings[name]

    if (!bound) {
      if (!ignoreUnbound) {
        throw new AppError('feedback.errors.validation.unbound', { name })
      } else bound = atom(name.charAt(1))!
    }
    return bound
  }

  switch (pattern.kind) {
    case 'atom':
      return atom(pattern.name)

    case 'imp':
      return imp(instantiate(pattern.left, bindings), instantiate(pattern.right, bindings))

    case 'not':
      return not(instantiate(pattern.inner, bindings))

    default:
      throw new AppError('feedback.errors.validation.unknown_formula')
  }
}
