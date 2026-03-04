import type { ProofError } from '../proof/ProofError'
import { formulaToString, type Formula } from '../syntax/Formula'
import { matchWithBindings } from './InferenceRule'

export interface AxiomSchema {
  name: string
  schema: Formula
}

export function axiomToString(axiom: AxiomSchema): string {
  return formulaToString(axiom.schema).replace('?', '').toUpperCase()
}

export type SchemaBindings = Map<string, Formula>

export interface AxiomMatchResult {
  success: boolean
  bindings?: SchemaBindings
  error?: ProofError
}

export function matchAxiomSchema(schema: Formula, candidate: Formula): AxiomMatchResult {
  const bindings: SchemaBindings = new Map()

  const success = matchWithBindings(schema, candidate, bindings)

  if (!success) {
    return {
      success: false,
      error: { code: 'axiom_mismatch' },
    }
  }

  return {
    success: true,
    bindings,
  }
}
