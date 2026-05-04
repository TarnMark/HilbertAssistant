import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'

import { addStep } from '@/logic/proof/ProofEngine'

import {
  atom,
  formulaEquals,
  formulaToString,
  imp,
  makeSchemaVariables,
  parseFormula,
  type Formula,
} from '@/logic/syntax/Formula'
import { emptyProofState, type ProofState } from '@/logic'
import { analyzeMaxProgress, type StepFeedback } from '@/logic/feedback/StepAnalyzer'
import { serializeState } from '@/workers/analyze.worker'
import { AppError } from '@/logic/proof/AppError'
import type { Justification, VisualJustification } from '@/logic/proof/Justification'

export const useProofStore = defineStore('proof', () => {
  const state = ref<ProofState>(emptyProofState())
  const stateHistory = ref<ProofState[]>([])
  // const lastError = ref<ProofError |string | null>(null)

  // const heuristic = new HeuristicEvaluator()
  // const analyzer = new StepAnalyzer()

  const assumptions = computed(() => state.value.assumptions)
  const axioms = computed(() => state.value.axioms)
  const rules = computed(() => state.value.rules)

  const goal = ref<Formula>(imp(atom('B'), atom('A')))
  const initialized = ref(false)

  const stepFeedback = ref<Record<number, StepFeedback | null>>({ 0: null })
  const feedback = computed(() => stepFeedback.value[stateHistory.value.length])
  const progress = ref(0)
  const maxScore = ref(0)

  const goalAchieved = computed(() =>
    state.value.steps.length == 0
      ? false
      : formulaEquals(state.value.steps[state.value.steps.length - 1]?.formula!, goal.value),
  )

  function initializeSession(
    extendedRuleset: boolean,
    assumptionStrings: string[],
    goalString: string,
  ): { success: boolean; error?: AppError } {
    let parsedAssumptions: Formula[] = []
    let parsedGoal: Formula

    try {
      parsedAssumptions = assumptionStrings
        .filter((s) => s.trim().length > 0)
        .map((s) => parseFormula(s))

      parsedGoal = parseFormula(goalString)
    } catch (e) {
      if (e instanceof AppError) {
        return { success: false, error: e }
      } else return { success: false }
    }

    state.value = emptyProofState([], parsedAssumptions, extendedRuleset)
    // assumptions = state.value.assumptions
    // axioms = state.value.axioms
    // rules = state.value.rules
    stateHistory.value = [state.value]
    goal.value = parsedGoal
    recalculateMaxProgress()
    initialized.value = true

    return { success: true }
  }

  // ----------------------------
  // Derived Data (UI-facing)
  // ----------------------------

  const steps = computed(() => state.value.steps)

  const availableJustifications = computed<VisualJustification[]>(() => [
    ...assumptions.value.getAll().map((a) => ({
      name: a.name,
      formula: formulaToString(a.formula),
      category: 'assumption' as const,
      // inputs: false,
    })),

    ...axioms.value.getAll().map((a) => ({
      name: a.name,
      formula: formulaToString(a.schema),
      category: 'axiom' as const,
      inputs: a.premises,
    })),

    ...rules.value.getAll().map((r) => ({
      name: r.name,
      formula: formulaToString(r.conclusion),
      category: 'rule' as const,
      inputs: r.premises ?? [],
      // inputs: true,
    })),
  ])

  // ----------------------------
  // Public Action: Commit Step
  // ----------------------------

  function commitStep(
    formulaString: string,
    justification: Justification,
  ): { success: boolean; error?: AppError } {
    if (!initialized.value)
      return { success: false, error: new AppError('feedback.errors.newstep.not_initialized') }

    // lastError.value = null

    let parsedFormula

    try {
      parsedFormula = parseFormula(formulaString)
    } catch (e) {
      return { success: false, error: new AppError((e as Error).message) }
    }

    state.value.axioms = axioms.value
    state.value.rules = rules.value
    const result = addStep(state.value, parsedFormula, justification)

    if (!result.success) {
      // const message = result.error ?? 'feedback.errors.newstep.rejected'
      // lastError.value = message
      return { success: false, error: result.error }
    }
    // console.log(result.feedback!.kind)

    // const score1 = result.feedback!.score
    // console.log(score1)

    state.value = result.state!
    stateHistory.value.push(state.value)

    return { success: true }
  }

  async function analyzeStep() {
    const states = stateHistory.value.length
    stepFeedback.value[states] = null
    if (states < 2) return { kind: 'invalid', reason: { code: 'steps_missing' } }

    status.value = { kind: 'analyzing' }

    const worker = getWorker()

    return new Promise((resolve) => {
      worker.onmessage = (e) => {
        status.value = { kind: 'idle' }

        const { ok, result, error } = e.data

        if (!ok) {
          status.value = { kind: 'error', message: error }
          console.log(error)
          return
        }

        stepFeedback.value[states] = result
        progress.value = 1 - Math.max(0, Math.min(maxScore.value, result.score)) / maxScore.value

        const score = feedback.value?.score.toString()
        status.value = { kind: 'hint', message: feedback.value?.message, params: { score } }

        resolve(result)
      }
      worker.postMessage({
        current: serializeState(stateHistory.value[states - 1]!),
        previous: serializeState(stateHistory.value[states - 2]!),
        goal: formulaToString(goal.value),
      })
    })
  }

  function undoStep() {
    if (stateHistory.value.length > 1) {
      stateHistory.value.pop()!
      state.value = stateHistory.value[stateHistory.value.length - 1]!
      resetStatus('')
    }
  }

  function removeJustification(j: VisualJustification) {
    switch (j.category) {
      case 'assumption':
        assumptions.value.remove(j.name)
        break
      case 'axiom':
        axioms.value.remove(j.name)
        break
      case 'rule':
        rules.value.remove(j.name)
        break
    }
    recalculateMaxProgress()
  }

  function addJustification(j: VisualJustification) {
    // try {
    if (j.name === '') throw new AppError('feedback.errors.registries.noname')
    if (j.formula === '') throw new AppError('feedback.errors.registries.empty')

    const formula = parseFormula(j.formula, j.category !== 'assumption')

    switch (j.category) {
      case 'assumption':
        assumptions.value.add({ name: j.name, formula })
        resetStatus()
        break
      case 'axiom':
        axioms.value.add({ name: j.name, schema: formula })
        break
      case 'rule':
        rules.value.add({
          name: j.name,
          premises: j.inputs ?? [],
          conclusion: formula,
        })
        break
    }
    recalculateMaxProgress()
    // } catch (error) {
    //   status.value = { kind: 'error', message: (error as Error).message }
    // }
  }

  let worker: Worker | null = null
  function getWorker() {
    if (!worker) {
      worker = new Worker(new URL('../workers/analyze.worker.ts', import.meta.url), {
        type: 'module',
      })
    }
    return worker
  }

  type ProofStatus = {
    kind: 'idle' | 'analyzing' | 'error' | 'hint' | 'goal'
    message?: string
    error?: AppError
    params?: Record<string, unknown>
  }

  const status = ref<ProofStatus>({ kind: 'idle' })

  function setStatus(newStatus: ProofStatus) {
    if (status.value.kind === 'analyzing') return
    status.value = {
      kind: newStatus.kind,
      message: newStatus.message ?? status.value.message,
      error: newStatus.error ?? undefined,
      params: newStatus.params ?? undefined,
    }
  }
  function resetStatus(message?: string) {
    status.value = { kind: 'idle', message: message ?? status.value.message }
  }

  function recalculateMaxProgress() {
    maxScore.value = analyzeMaxProgress(state.value, goal.value)
  }

  return {
    steps,
    initialized,
    goal,
    goalAchieved,
    availableJustifications,

    feedback,
    progress,

    status,
    setStatus,
    resetStatus,

    commitStep,
    analyzeStep,
    undoStep,
    removeJustification,
    addJustification,
    initializeSession,
  }
})
