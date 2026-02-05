import type { Formula } from '../syntax/Formula'

export type Justification =
  | { kind: 'axiom'; schemaName: string }
  | { kind: 'mp'; from: [number, number] }

export interface ProofStep {
  index: number
  formula: Formula
  justification: Justification
}
