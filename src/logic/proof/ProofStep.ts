import type { Formula } from '../syntax/Formula'

export type Justification =
  | { kind: 'axiom'; schemaName: string }
  | { kind: 'rule'; ruleName: string; from: number[] }
  | { kind: 'assumption'; name: string }

export function formatJustification(j: Justification): string {
  switch (j.kind) {
    case 'assumption':
      return j.name
    case 'axiom':
      return `Axiom ${j.schemaName}`
    case 'rule':
      return `${j.ruleName} ${j.from.map((n) => n + 1).join(', ')}`
  }
}

export interface ProofStep {
  index: number
  formula: Formula
  justification: Justification
}
