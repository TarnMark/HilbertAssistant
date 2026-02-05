// src/logic/syntax/Substitution.ts

import type { Formula } from './Formula'
// import type { Term } from "./Term"

// export type TermSubstitution = Map<string, Term>

export interface SubstitutionResult {
  success: boolean
  formula?: Formula
  error?: string
}
