import { atom, formulaToString, imp, not, type Atom, type Formula } from '../syntax/Formula'
import type { AxiomSchema } from './AxiomSchema'

export class AxiomRegistry {
  axioms = new Map<string, AxiomSchema>()

  add(axiom: AxiomSchema) {
    if (this.axioms.has(axiom.name)) {
      throw new Error('Axiom already exists: ${axiom.name}')
    }
    axiom.inputs = calculateInputs(axiom.schema)
    this.axioms.set(axiom.name, axiom)
  }

  remove(axiom: string) {
    if (!this.axioms.delete(axiom)) {
      throw new Error('No such axiom found: ' + axiom)
    }
  }

  get(name: string) {
    return this.axioms.get(name)
  }

  getAll(): AxiomSchema[] {
    return Array.from(this.axioms.values())
  }
}

export function createDefaultAxiomRegistry(): AxiomRegistry {
  const registry = new AxiomRegistry()

  // default axioms

  // H1
  // p->(q->p)
  registry.add({
    name: 'A1',
    schema: imp(atom('?F'), imp(atom('?G'), atom('?F'))),
  })

  // H2
  //(p->(q->r))->((p->q)->(p->r))

  registry.add({
    name: 'A2',
    schema: imp(
      imp(atom('?F'), imp(atom('?G'), atom('?H'))),
      imp(imp(atom('?F'), atom('?G')), imp(atom('?F'), atom('?H'))),
    ),
  })
  // H3
  //(¬p→¬q)→(q→p)
  registry.add({
    name: 'A3',
    schema: imp(imp(not(atom('?F')), not(atom('?G'))), imp(atom('?G'), atom('?F'))),
  })

  return registry
}

function calculateInputs(axiom: Formula): Atom[] {
  return calculateInputsVars([formulaToString(axiom)]) //.map((a) => atom(a))
}

export function calculateInputsVars(axioms: string[]): Atom[] {
  const vars = new Set<string>()

  for (let i = 0; i < axioms.length; i++) {
    const axiom = axioms[i]

    if (axiom) Array.from(axiom.matchAll(/[A-Z]/g)).forEach((a) => vars.add(a[0]))
  }

  // console.log(vars)
  return [...vars].map((a) => atom(a)).sort()
}
