import { atom, imp, not } from '../syntax/Formula'
import type { AxiomSchema } from './AxiomSchema'

export class AxiomRegistry {
  axioms = new Map<string, AxiomSchema>()

  add(axiom: AxiomSchema) {
    if (this.axioms.has(axiom.name)) {
      throw new Error('Axiom already exists: ${axiom.name}')
    }
    this.axioms.set(axiom.name, axiom)
  }

  remove(axiom: string) {
    console.log(this.axioms.keys())
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
    name: 'H1',
    schema: imp(atom('?P'), imp(atom('?Q'), atom('?P'))),
  })

  // H2
  //(p->(q->r))->((p->q)->(p->r))

  registry.add({
    name: 'H2',
    schema: imp(
      imp(atom('?P'), imp(atom('?Q'), atom('?R'))),
      imp(imp(atom('?P'), atom('?Q')), imp(atom('?P'), atom('?R'))),
    ),
  })
  // H3
  //(¬p→¬q)→(q→p)
  registry.add({
    name: 'H3',
    schema: imp(imp(not(atom('?P')), not(atom('?Q'))), imp(atom('?Q'), atom('?P'))),
  })

  return registry
}
