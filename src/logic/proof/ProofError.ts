export type ProofErrorCode =
  | 'unknown_justification'
  | 'unknown_axiom_schema'
  | 'axiom_mismatch'
  | 'mp_reference_missing'
  | 'mp_future_reference'
  | 'mp_not_implication'
  | 'mp_antecedent_mismatch'
  | 'mp_conclusion_mismatch'
  | 'mp_failed'
  | 'invalid_assumption'
  | 'unknown_rule'

export interface ProofError {
  code: ProofErrorCode
  data?: Record<string, unknown>
}
