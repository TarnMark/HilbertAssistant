import type { Formula } from '../syntax/Formula'

export interface ModusPonensResult {
  success: boolean
  derived?: Formula
  error?: string
}

export function applyModusPonens(antecedent: Formula, implication: Formula): ModusPonensResult {
  return {
    success: false,
    error: 'Not implemented',
  }
}
