import { AssumptionRegistry } from '../rules/AssumptionRegistry'
import { AxiomRegistry } from '../rules/AxiomRegistry'
import { RuleRegistry } from '../rules/RuleRegistry'
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
    axioms: AxiomRegistry.defaultRegistry(),
    rules: RuleRegistry.defaultRegistry(extendedRuleset),
    steps: steps,
  }
}
