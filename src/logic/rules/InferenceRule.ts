import { formulaEquals, type Formula } from '../syntax/Formula'

export interface InferenceRule {
  name: string
  premises: Formula[]
  conclusion: Formula
}

export function isSchemaVariable(f: Formula): f is { kind: 'atom'; name: string } {
  return f.kind === 'atom' && f.name.startsWith('?')
}

// export function matchWithBindings(
//   pattern: Formula,
//   candidate: Formula,
//   bindings: Map<string, Formula>,
// ): boolean {
//   if (isSchemaVariable(pattern)) {
//     const existing = bindings.get(pattern.name)

//     if (!existing) {
//       bindings.set(pattern.name, candidate)
//       return true
//     }

//     return formulaEquals(existing, candidate)
//   }

//   if (pattern.kind !== candidate.kind) {
//     return false
//   }

//   switch (pattern.kind) {
//     // case 'atom':
//     //   return pattern.name === candidate.name

//     case 'imp':
//       if (candidate.kind != 'imp') return false
//       return (
//         matchWithBindings(pattern.left, candidate.left, bindings) &&
//         matchWithBindings(pattern.right, candidate.right, bindings)
//       )

//     case 'not':
//       if (candidate.kind != 'not') return false
//       return matchWithBindings(pattern.inner, candidate.inner, bindings)

//     default:
//       return false
//   }
// }

export function matchWithBindings(
  pattern: Formula,
  candidate: Formula,
  bindings: Record<string, Formula> = {},
): Record<string, Formula> | null {
  switch (pattern.kind) {
    case 'atom': {
      const name = pattern.name

      if (isSchemaVariable(pattern)) {
        const existing = bindings[name]

        if (!existing) {
          bindings[name] = candidate
          return bindings
        }
        // return formulaEquals(existing, candidate) ? bindings : null
      }
      if (!bindings[name]) {
        bindings[name] = candidate
        return bindings
      }

      return formulaEquals(bindings[name], candidate) ? bindings : null
    }

    case 'not':
      if (candidate.kind !== 'not') return null
      return matchWithBindings(pattern.inner, candidate.inner, bindings)

    case 'imp':
      if (candidate.kind !== 'imp') return null

      const leftMatch = matchWithBindings(pattern.left, candidate.left, bindings)
      if (!leftMatch) return null

      return matchWithBindings(pattern.right, candidate.right, bindings)
  }
}
