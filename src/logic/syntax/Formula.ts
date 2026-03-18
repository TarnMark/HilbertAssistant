export type Formula = Atom | Implication | Negation //| UniversalQuantifier | ExistentialQuantifier

export function formulaToString(f: Formula): string {
  switch (f.kind) {
    case 'atom':
      return f.name.replace('?', '')

    case 'not':
      return `¬${wrapIfNeeded(f.inner)}`

    case 'imp':
      return `${wrapIfNeeded(f.left)} → ${wrapIfNeeded(f.right)}`
  }
}

function wrapIfNeeded(f: Formula): string {
  if (f.kind === 'atom' || (f.kind === 'not' && f.inner.kind === 'atom')) return formulaToString(f)
  return `(${formulaToString(f)})`
}

export interface Atom {
  kind: 'atom'
  name: string
  //args?: Term[] // empty for propositional logic
}

export interface Implication {
  kind: 'imp'
  left: Formula
  right: Formula
}

export interface Negation {
  kind: 'not'
  inner: Formula
}

export function atom(name: string): Atom {
  return {
    kind: 'atom',
    name,
  }
}

export function imp(left: Formula, right: Formula): Implication {
  return {
    kind: 'imp',
    left,
    right,
  }
}

export function not(inner: Formula): Negation {
  return {
    kind: 'not',
    inner,
  }
}

export function formulaEquals(a: Formula, b: Formula): boolean {
  if (a.kind !== b.kind) {
    return false
  }

  switch (a.kind) {
    case 'atom':
      return b.kind === 'atom' && a.name === b.name

    case 'imp':
      return b.kind === 'imp' && formulaEquals(a.left, b.left) && formulaEquals(a.right, b.right)

    case 'not':
      return b.kind === 'not' && formulaEquals(a.inner, b.inner)
  }
}

export function makeSchemaVariables(f: Formula): Formula {
  switch (f.kind) {
    case 'atom': {
      f.name = '?' + f.name
      return f
    }

    case 'not':
      return makeSchemaVariables(f.inner)

    case 'imp': {
      f.left = makeSchemaVariables(f.left)
      f.right = makeSchemaVariables(f.right)
      return f
    }
  }
}

// export interface UniversalQuantifier {
//   kind: 'forall'
//   variable: string
//   body: Formula
// }

// export interface ExistentialQuantifier {
//   kind: 'exists'
//   variable: string
//   body: Formula
// }

// import type { Term } from './Term'
