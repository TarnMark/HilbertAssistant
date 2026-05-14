import { deserializeState, parseFormula } from '@/logic'
import { analyze } from '@/feedback/StepAnalyzer'

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
