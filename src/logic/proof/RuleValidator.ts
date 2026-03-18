import type { ProofState } from '../proof/ProofState'
import type { InferenceRule } from '../rules/InferenceRule'
import { isSchemaVariable, matchWithBindings } from '../rules/InferenceRule'
import { formulaEquals, imp, not, type Formula } from '../syntax/Formula'

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

  const bindings = new Map<string, Formula>()

  if (rule.premises.length === 0) {
    const ok = matchWithBindings(rule.conclusion, conclusion, bindings)

    if (!ok) return { success: false }
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
        return { success: false }
      }
    }
  }
  // instantiate conclusion
  const instantiated = instantiate(rule.conclusion, bindings)

  if (!formulaEquals(instantiated, conclusion)) {
    return { success: false }
  }

  return { success: true }
}

export function instantiate(pattern: Formula, bindings: Map<string, Formula>): Formula {
  if (isSchemaVariable(pattern)) {
    const bound = bindings.get(pattern.name)

    if (!bound) {
      throw new Error('Unbound schema variable:' + pattern.name)
    }

    return bound
  }

  switch (pattern.kind) {
    // case 'atom':
    //   return atom(pattern.name)

    case 'imp':
      return imp(instantiate(pattern.left, bindings), instantiate(pattern.right, bindings))

    case 'not':
      return not(instantiate(pattern.inner, bindings))

    default:
      throw new Error('Unknown formula kind')
  }
}
