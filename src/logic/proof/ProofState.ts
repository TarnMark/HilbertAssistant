import { AssumptionRegistry, type SerializedAssumption } from '../rules/AssumptionRegistry'
import { AxiomRegistry } from '../rules/AxiomRegistry'
import type { SerializedAxiom } from '../rules/AxiomSchema'
import type { SerializedRule } from '../rules/InferenceRule'
import { RuleRegistry } from '../rules/RuleRegistry'
import { formulaToString, parseFormula, type Formula } from '../syntax/Formula'
import { formatJustification, parseJustification } from './Justification'
import type { ProofStep, SerializedStep } from './ProofStep'

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

export type SerializedState = {
  assumptions: SerializedAssumption[]
  axioms: SerializedAxiom[]
  rules: SerializedRule[]
  steps: SerializedStep[]
}

export function serializeState(state: ProofState): SerializedState {
  return {
    assumptions: state.assumptions.getAll().map((a) => ({
      name: a.name,
      formula: formulaToString(a.formula),
    })),

    axioms: state.axioms.getAll().map((a) => ({
      name: a.name,
      schema: formulaToString(a.schema),
    })),

    rules: state.rules.getAll().map((r) => ({
      name: r.name,
      premises: r.premises?.map((p) => formulaToString(p)) ?? [],
      conclusion: formulaToString(r.conclusion),
    })),

    steps: state.steps.map((s) => ({
      index: s.index,
      formula: formulaToString(s.formula),
      justification: formatJustification(s.justification),
    })),
  }
}

export function deserializeState(s: SerializedState): ProofState {
  return {
    assumptions: AssumptionRegistry.from(
      ...s.assumptions.map((a) => ({
        name: a.name,
        formula: parseFormula(a.formula),
      })),
    ),

    axioms: AxiomRegistry.from(
      ...s.axioms.map((a) => ({
        name: a.name,
        schema: parseFormula(a.schema, true),
      })),
    ),

    rules: RuleRegistry.from(
      ...s.rules.map((r) => ({
        name: r.name,
        premises: r.premises.map((p) => parseFormula(p, true)),
        conclusion: parseFormula(r.conclusion, true),
      })),
    ),

    steps: s.steps.map((step) => ({
      index: step.index,
      formula: parseFormula(step.formula),
      justification: parseJustification(step.justification),
    })),
  }
}
