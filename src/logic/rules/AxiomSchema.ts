import { AppError } from '../proof/AppError'
import { formulaToString, type Atom, type Formula } from '../syntax/Formula'
import { matchWithBindings } from './InferenceRule'

export interface AxiomSchema {
  name: string
  schema: Formula
  premises?: Atom[]
}

export function axiomToString(axiom: AxiomSchema): string {
  return formulaToString(axiom.schema).replace('?', '').toUpperCase()
}

export type SchemaBindings = Record<string, Formula>

export interface AxiomMatchResult {
  success: boolean
  bindings: SchemaBindings
  error?: AppError
}

export function matchAxiomSchema(
  schema: Formula,
  candidate: Formula,
  bindings: SchemaBindings = {},
): AxiomMatchResult {
  const success = matchWithBindings(schema, candidate, bindings)

  if (!success) {
    return {
      success: false,
      bindings: {},
      error: new AppError('feedback.errors.validation.axiom_mismatch'),
    }
  }

  return {
    success: true,
    bindings,
  }
}
