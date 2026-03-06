import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { addStep } from '@/logic/proof/ProofEngine'

import { AxiomRegistry, createDefaultAxiomRegistry } from '@/logic/rules/AxiomRegistry'
import { createDefaultRuleRegistry, RuleRegistry } from '@/logic/rules/RuleRegistry'

import { atom, formulaEquals, formulaToString, imp, type Formula } from '@/logic/syntax/Formula'
import { emptyProofState, formatJustification, type Justification, type ProofState } from '@/logic'
import { parseFormula, type VisualJustification } from '@/helpers'

export const useProofStore = defineStore('proof', () => {
  // ----------------------------
  // Core Logic Infrastructure
  // ----------------------------

  const axioms = ref<AxiomRegistry>(createDefaultAxiomRegistry())
  const rules = ref<RuleRegistry>(createDefaultRuleRegistry())
  // const validator = new Validator()
  // TODO: dynamic validator

  // ----------------------------
  // Reactive Proof State
  // ----------------------------
  const assumptions = ref<Formula[]>([atom('A')])

  const state = ref<ProofState>(emptyProofState([], assumptions.value))
  const stateHistory = ref<ProofState[]>([])
  stateHistory.value.push(state.value)
  const lastError = ref<string | null>(null)

  //   const all = new Map<string, Formula[] | AxiomRegistry | RuleRegistry>()
  // all.set('assumptions', assumptions.value)
  // all.set('axioms', axioms)
  // all.set('rules', rules)

  const goal = ref<string>('B > A')

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
    ...assumptions.value.map((a) => ({
      name: 'Hypothesis',
      formula: formulaToString(a),
      category: 'assumption' as const,
      inputs: false,
    })),

    ...axioms.value.getAll().map((a) => ({
      name: a.name,
      formula: formulaToString(a.schema),
      category: 'axiom' as const,
      inputs: false,
    })),

    ...rules.value.getAll().map((r) => ({
      name: r.name,
      formula:
        r.premises?.map((f) => formulaToString(f)).join(', ') +
        ' => ' +
        formulaToString(r.conclusion),
      category: 'rule' as const,
      inputs: true,
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

    state.value.axioms = axioms.value
    state.value.rules = rules.value
    const result = addStep(state.value, parsedFormula, justification)

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

  function removeJustification(j: VisualJustification) {
    switch (j.category) {
      case 'assumption':
        assumptions.value.splice(
          assumptions.value.findIndex((f) => f === parseFormula(j.formula)),
          1,
        )
        return
      case 'axiom':
        axioms.value.remove(j.name)
        return
      case 'rule':
        rules.value.remove(j.name)
        return
    }
  }

  return {
    // reactive data
    steps,
    // stateHistory,
    // state,
    axioms,
    rules,
    goal,
    goalAchieved,
    lastError,
    availableJustifications,

    // actions
    commitStep,
    undoStep,
    removeJustification,
  }
})
