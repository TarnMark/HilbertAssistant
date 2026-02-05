import type { Formula } from '../syntax/Formula'

export interface AxiomSchema {
  name: string
  schema: Formula
}

export interface AxiomMatchResult {
  matches: boolean
  error?: string
}
