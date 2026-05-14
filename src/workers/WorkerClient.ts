import { serializeState, type ProofState } from '@/logic'
import type { StepFeedback } from '@/feedback/StepAnalyzer'

// general

export function stopWorkers() {
  workerAnalyze?.terminate()
  workerProgress?.terminate()
}

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
