import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'

import { addStep } from '@/logic/proof/ProofEngine'

import { AxiomRegistry, createDefaultAxiomRegistry } from '@/logic/rules/AxiomRegistry'
import { createDefaultRuleRegistry, RuleRegistry } from '@/logic/rules/RuleRegistry'

import {
  atom,
  formulaEquals,
  formulaToString,
  imp,
  makeSchemaVariables,
  type Formula,
} from '@/logic/syntax/Formula'
import { emptyProofState, formatJustification, type Justification, type ProofState } from '@/logic'
import { parseFormula, type VisualJustification } from '@/helpers'

export const useProofStore = defineStore('proof', () => {
  const assumptions = ref<Formula[]>([])

  const state = ref<ProofState>(emptyProofState())
  const stateHistory = ref<ProofState[]>([])
  // stateHistory.value.push(state.value)
  const lastError = ref<string | null>(null)

  let axioms = reactive(state.value.axioms)
  let rules = reactive(state.value.rules)

  const goal = ref<Formula>(imp(atom('B'), atom('A')))
  const initialized = ref(false)

  const goalAchieved = computed(() =>
    state.value.steps.length == 0
      ? false
      : formulaEquals(state.value.steps[state.value.steps.length - 1]?.formula!, goal.value),
  )

  function initializeSession(
    extendedRuleset: boolean,
    assumptionStrings: string[],
    goalString: string,
  ): { success: boolean; error?: string } {
    let parsedAssumptions: Formula[] = []
    let parsedGoal: Formula

    try {
      parsedAssumptions = assumptionStrings
        .filter((s) => s.trim().length > 0)
        .map((s) => parseFormula(s))

      parsedGoal = parseFormula(goalString)
    } catch {
      return { success: false, error: 'Invalid formula syntax.' }
    }

    assumptions.value = parsedAssumptions
    state.value = emptyProofState([], parsedAssumptions, extendedRuleset)
    axioms = state.value.axioms
    rules = state.value.rules
    stateHistory.value = [state.value]
    goal.value = parsedGoal
    initialized.value = true

    return { success: true }
  }

  // ----------------------------
  // Derived Data (UI-facing)
  // ----------------------------

  const steps = computed(() => state.value.steps)

  const availableJustifications = computed<VisualJustification[]>(() => [
    ...assumptions.value.map((a) => ({
      name: 'Hypothesis',
      formula: formulaToString(a),
      category: 'assumption' as const,
      // inputs: false,
    })),

    ...axioms.getAll().map((a) => ({
      name: a.name,
      formula: formulaToString(a.schema),
      category: 'axiom' as const,
      // inputs: false,
    })),

    ...rules.getAll().map((r) => ({
      name: r.name,
      formula:
        r.premises?.map((f) => formulaToString(f)).join(', ') +
        (r.premises?.length ? ' => ' : '') +
        formulaToString(r.conclusion),
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
  ): { success: boolean; error?: string } {
    if (!initialized.value) return { success: false, error: 'Session is not initialized yet.' }

    lastError.value = null

    let parsedFormula

    try {
      parsedFormula = parseFormula(formulaString)
    } catch {
      return { success: false, error: 'Invalid formula syntax.' }
    }

    state.value.axioms = axioms
    state.value.rules = rules
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
        axioms.remove(j.name)
        return
      case 'rule':
        rules.remove(j.name)
        return
    }
  }

  function addJustification(j: VisualJustification) {
    const formula = parseFormula(j.formula)

    switch (j.category) {
      case 'assumption':
        assumptions.value.push(formula)
        return
      case 'axiom':
        axioms.add({ name: j.name, schema: makeSchemaVariables(formula) })
        return
      case 'rule':
        rules.register({
          name: j.name,
          premises: j.inputs?.map((i) => makeSchemaVariables(i)) ?? [],
          conclusion: makeSchemaVariables(formula),
        })
        return
    }
  }

  return {
    // reactive data
    steps,
    // stateHistory,
    // state,
    // axioms,
    // rules,
    initialized,
    goal,
    goalAchieved,
    lastError,
    availableJustifications,

    // actions
    commitStep,
    undoStep,
    removeJustification,
    addJustification,
    initializeSession,
  }
})
