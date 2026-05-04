import { formulaToString, parseFormula, type ProofState } from '@/logic'
import { analyze } from '@/logic/feedback/StepAnalyzer'
import { formatJustification, parseJustification } from '@/logic/proof/Justification'
import { AssumptionRegistry } from '@/logic/rules/AssumptionRegistry'
import { AxiomRegistry } from '@/logic/rules/AxiomRegistry'
import { RuleRegistry } from '@/logic/rules/RuleRegistry'

self.onmessage = (event) => {
  const { current, previous, goal } = event.data

  try {
    const previousState = deserializeState(previous)
    const currentState = deserializeState(current)
    const goalFormula = parseFormula(goal)

    const result = analyze(previousState, currentState, goalFormula)

    self.postMessage({
      ok: true,
      result,
    })
  } catch (error) {
    self.postMessage({
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

// ==========================================
// Serialization
// ==========================================
type SerializedStep = {
  index: number
  formula: string
  justification: string
}

type SerializedAssumption = {
  name: string
  formula: string
}

type SerializedAxiom = {
  name: string
  schema: string
}

type SerializedRule = {
  name: string
  premises: string[]
  conclusion: string
}

type SerializedState = {
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
      premises: r.premises?.map(formulaToString) ?? [],
      conclusion: formulaToString(r.conclusion),
    })),

    steps: state.steps.map((s) => ({
      index: s.index,
      formula: formulaToString(s.formula),
      justification: formatJustification(s.justification),
    })),
  }
}

function deserializeState(s: SerializedState): ProofState {
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
