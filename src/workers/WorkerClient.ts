import { formulaToString, parseFormula, type ProofState } from '@/logic'
import type { StepFeedback } from '@/logic/feedback/StepAnalyzer'
import { formatJustification, parseJustification } from '@/logic/proof/Justification'
import { AssumptionRegistry } from '@/logic/rules/AssumptionRegistry'
import { AxiomRegistry } from '@/logic/rules/AxiomRegistry'
import { RuleRegistry } from '@/logic/rules/RuleRegistry'

// step analysis worker

let workerAnalyze: Worker | null = null
function getAnalyzeWorker() {
  if (!workerAnalyze) {
    workerAnalyze = new Worker(new URL('./analyze.worker.ts', import.meta.url), {
      type: 'module',
    })
  }
  return workerAnalyze
}

export function analyzeStepAsync(
  currentState: ProofState,
  previousState: ProofState,
  goal: string,
): Promise<StepFeedback> {
  const worker = getAnalyzeWorker()

  return new Promise((resolve) => {
    worker.onmessage = (e) => {
      const { ok, result, error } = e.data

      if (!ok) {
        throw new Error(error)
      }

      resolve(result)
    }
    worker.postMessage({
      current: serializeState(currentState),
      previous: serializeState(previousState),
      goal,
    })
  })
}

// progress recalculation worker

let workerProgress: Worker | null = null

export function getProgressWorker() {
  if (!workerProgress) {
    workerProgress = new Worker(new URL('./progress.worker.ts', import.meta.url), {
      type: 'module',
    })
  }
  return workerProgress
}

export function computeProgressAsync(state: ProofState, goal: string): Promise<number> {
  const worker = getProgressWorker()

  return new Promise((resolve) => {
    worker.onmessage = (e) => {
      const { ok, result, error } = e.data

      if (!ok) {
        throw new Error(error)
      }

      resolve(result)
    }
    worker.postMessage({
      state: serializeState(state),
      goal,
    })
  })
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
