import type { Formula } from '../syntax/Formula'
import type { ProofStep } from './ProofStep'

export interface ProofState {
  assumptions: Formula[]
  steps: ProofStep[]
}
