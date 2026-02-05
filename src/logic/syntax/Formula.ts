export type Formula = Atom | Implication | Negation | UniversalQuantifier | ExistentialQuantifier

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

export interface UniversalQuantifier {
  kind: 'forall'
  variable: string
  body: Formula
}

export interface ExistentialQuantifier {
  kind: 'exists'
  variable: string
  body: Formula
}

// import type { Term } from './Term'
