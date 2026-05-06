import type { Formula } from '../syntax/Formula'
import type { Justification } from './Justification'

export interface ProofStep {
  index: number
  formula: Formula
  justification: Justification
}

export type SerializedStep = {
  index: number
  formula: string
  justification: string
}
