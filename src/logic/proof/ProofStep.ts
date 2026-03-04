import type { Formula } from '../syntax/Formula'

export type Justification =
  | { kind: 'axiom'; schemaName: string }
  | { kind: 'rule'; ruleName: string; from: number[] }
  | { kind: 'assumption' }

export function formatJustification(j: Justification): string {
  switch (j.kind) {
    case 'assumption':
      return 'Hypothesis'
    case 'axiom':
      return `Axiom ${j.schemaName}`
    case 'rule':
      return `${j.ruleName} ${j.from.join(', ')}`
  }
}

export interface ProofStep {
  index: number
  formula: Formula
  justification: Justification
}
