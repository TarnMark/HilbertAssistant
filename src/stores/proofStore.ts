import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { emptyProofState, addStep } from '@/logic/proof/ProofEngine'

import { createDefaultAxiomRegistry } from '@/logic/rules/AxiomRegistry'
import { createDefaultRuleRegistry } from '@/logic/rules/RuleRegistry'

import { atom, formulaEquals, formulaToString, imp } from '@/logic/syntax/Formula'
import { formatJustification, Validator, type Justification, type ProofState } from '@/logic'
import { parseFormula, type VisualJustification } from '@/helpers'

export const useProofStore = defineStore('proof', () => {
  // ----------------------------
  // Core Logic Infrastructure
  // ----------------------------

  const axioms = createDefaultAxiomRegistry()
  const rules = createDefaultRuleRegistry()
  const validator = new Validator(axioms, rules)

  // ----------------------------
  // Reactive Proof State
  // ----------------------------

  const state = ref<ProofState>(emptyProofState())
  const stateHistory = ref<ProofState[]>([])
  stateHistory.value.push(state.value)
  const lastError = ref<string | null>(null)

  const goal = ref<string>('A>(B>A)')

  const goalAchieved = computed(() =>
    state.value.steps.length == 0
      ? false
      : formulaEquals(
          state.value.steps[state.value.steps.length - 1]?.formula!,
          parseFormula(goal.value),
        ),
  )

  // ----------------------------
  // Derived Data (UI-facing)
  // ----------------------------

  const steps = computed(() => state.value.steps)

  const availableJustifications = computed<VisualJustification[]>(() => [
    // { kind: 'assumption' as const },

    ...axioms.getAll().map((a) => ({
      name: a.name,
      formula: formulaToString(a.schema),
      category: 'axiom' as const,
      inputs: false,
    })),

    ...rules.getAll().map((r) => ({
      name: r.name,
      formula:
        r.premises?.map((f) => formulaToString(f)).join(', ') +
        ' => ' +
        formulaToString(r.conclusion),
      category: 'rule' as const,
      inputs: true, //r.premises?.map((f) => formulaToString(f)),
    })),
  ])

  // ----------------------------
  // Public Action: Commit Step
  // ----------------------------

  function commitStep(
    formulaString: string,
    justification: Justification,
  ): { success: boolean; error?: string } {
    lastError.value = null

    let parsedFormula

    try {
      parsedFormula = parseFormula(formulaString)
    } catch {
      return { success: false, error: 'Invalid formula syntax.' }
    }

    const result = addStep(state.value, parsedFormula, justification, validator)

    if (!result.success) {
      const message = result.error?.code ?? 'Step rejected.'
      lastError.value = message
      return { success: false, error: message }
    }

    // Replace entire state (reactive trigger)
    state.value = result.state!
    stateHistory.value.push(state.value)

    return { success: true }
  }

  function undoStep() {
    if (stateHistory.value.length > 1) {
      stateHistory.value.pop()!
      state.value = stateHistory.value[stateHistory.value.length - 1]!
      // console.log('Undoing')
    }
  }

  return {
    // reactive data
    steps,
    // stateHistory,
    // state,
    goal,
    goalAchieved,
    lastError,
    availableJustifications,

    // actions
    commitStep,
    undoStep,
  }
})
