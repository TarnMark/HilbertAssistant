import { formulaEquals, type Formula } from '../syntax/Formula'

export interface InferenceRule {
  name: string
  premises?: Formula[]
  conclusion: Formula
}

export function isSchemaVariable(f: Formula): f is { kind: 'atom'; name: string } {
  return f.kind === 'atom' && f.name.startsWith('?')
}

export function matchWithBindings(
  pattern: Formula,
  candidate: Formula,
  bindings: Map<string, Formula>,
): boolean {
  if (isSchemaVariable(pattern)) {
    const existing = bindings.get(pattern.name)

    if (!existing) {
      bindings.set(pattern.name, candidate)
      return true
    }

    return formulaEquals(existing, candidate)
  }

  if (pattern.kind !== candidate.kind) {
    return false
  }

  switch (pattern.kind) {
    case 'atom':
      return pattern.name === candidate.name

    case 'imp':
      return (
        matchWithBindings(pattern.left, candidate.left, bindings) &&
        matchWithBindings(pattern.right, candidate.right, bindings)
      )

    case 'not':
      return matchWithBindings(pattern.inner, candidate.inner, bindings)

    default:
      return false
  }
}
