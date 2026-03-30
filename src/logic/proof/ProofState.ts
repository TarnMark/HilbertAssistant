import { AssumptionRegistry } from '../rules/AssumptionRegistry'
import { createDefaultAxiomRegistry, type AxiomRegistry } from '../rules/AxiomRegistry'
import { createDefaultRuleRegistry, type RuleRegistry } from '../rules/RuleRegistry'
import type { Formula } from '../syntax/Formula'
import type { ProofStep } from './ProofStep'

export interface ProofState {
  assumptions: AssumptionRegistry
  axioms: AxiomRegistry
  rules: RuleRegistry
  steps: ProofStep[]
}

export function emptyProofState(
  steps: ProofStep[] = [],
  assumptions: Formula[] = [],
  extendedRuleset: boolean = false,
): ProofState {
  return {
    assumptions: new AssumptionRegistry(assumptions),
    axioms: createDefaultAxiomRegistry(),
    rules: createDefaultRuleRegistry(extendedRuleset),
    steps: steps,
  }
}
