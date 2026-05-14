import { deserializeState, parseFormula } from '@/logic'
import { analyzeMaxProgress } from '@/feedback/StepAnalyzer'

self.onmessage = (event) => {
  const { state, goal } = event.data

  try {
    const activeState = deserializeState(state)
    const goalFormula = parseFormula(goal)

    const result = analyzeMaxProgress(activeState, goalFormula)

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
