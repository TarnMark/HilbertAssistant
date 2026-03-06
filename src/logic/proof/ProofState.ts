import { createDefaultAxiomRegistry, type AxiomRegistry } from '../rules/AxiomRegistry'
import { createDefaultRuleRegistry, type RuleRegistry } from '../rules/RuleRegistry'
import type { Formula } from '../syntax/Formula'
import type { ProofStep } from './ProofStep'

export interface ProofState {
  assumptions: Formula[]
  axioms: AxiomRegistry
  rules: RuleRegistry
  steps: ProofStep[]
}

export function emptyProofState(steps: ProofStep[] = [], assumptions: Formula[] = []): ProofState {
  return {
    assumptions,
    axioms: createDefaultAxiomRegistry(),
    rules: createDefaultRuleRegistry(),
    steps: steps,
  }
}
