import { AppError } from '../proof/AppError'
import { atom, formulaToString, imp, not, type Atom, type Formula } from '../syntax/Formula'
import type { AxiomSchema } from './AxiomSchema'
import { FormulaRegistry } from './FormulaRegistry'

export class AxiomRegistry extends FormulaRegistry<AxiomSchema> {
  formulas = new Map<string, AxiomSchema>()

  static from(...schemas: AxiomSchema[]): AxiomRegistry {
    const registry = new AxiomRegistry()
    schemas.forEach((s) => registry.tryadd(s))
    return registry
  }

  add(axiom: AxiomSchema) {
    const name = axiom.name
    if (this.formulas.has(name)) {
      throw new AppError('feedback.errors.registries.axiom_exists', { name })
    }
    axiom.premises = calculateInputs(axiom.schema)
    this.formulas.set(name, axiom)
  }

  tryadd(axiom: AxiomSchema) {
    if (this.formulas.has(axiom.name)) {
      return false
    }
    this.add(axiom)
    return true
  }

  remove(name: string) {
    if (!this.formulas.delete(name)) {
      throw new AppError('feedback.errors.registries.axiom_not_found', { name })
    }
  }

  tryremove(axiom: string): boolean {
    return this.formulas.delete(axiom)
  }

  get(name: string) {
    return this.formulas.get(name)
  }

  getAll(): AxiomSchema[] {
    return Array.from(this.formulas.values())
  }

  static defaultRegistry() {
    return AxiomRegistry.from(
      // H1
      // p->(q->p)
      {
        name: 'A1',
        schema: imp(atom('?F'), imp(atom('?G'), atom('?F'))),
      },

      // H2
      //(p->(q->r))->((p->q)->(p->r))
      {
        name: 'A2',
        schema: imp(
          imp(atom('?F'), imp(atom('?G'), atom('?H'))),
          imp(imp(atom('?F'), atom('?G')), imp(atom('?F'), atom('?H'))),
        ),
      },

      // H3
      //(¬p→¬q)→(q→p)
      {
        name: 'A3',
        schema: imp(imp(not(atom('?F')), not(atom('?G'))), imp(atom('?G'), atom('?F'))),
      },
    )
  }
}

export function calculateInputs(axiom: Formula): Atom[] {
  return calculateInputsVars([formulaToString(axiom)]) //.map((a) => atom(a))
}

export function calculateInputsVars(axioms: string[]): Atom[] {
  const vars = new Set<string>()

  for (let i = 0; i < axioms.length; i++) {
    const axiom = axioms[i]

    if (axiom) Array.from(axiom.matchAll(/[A-Z]/g)).forEach((a) => vars.add('?' + a[0]))
  }

  // console.log(vars)
  return [...vars].map((a) => atom(a)).sort()
}
