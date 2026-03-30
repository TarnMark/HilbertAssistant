import type { Formula } from '../syntax/Formula'

export type Assumption = {
  name: string
  formula: Formula
}

export class AssumptionRegistry {
  assumptions = new Map<string, Assumption>()

  constructor(assumptions: Formula[]) {
    assumptions.forEach((a, i) => {
      const name = 'H' + (i + 1)
      this.assumptions.set(name, { name: name, formula: a })
    })
  }

  add(assumption: Assumption) {
    if (this.assumptions.has(assumption.name)) {
      throw new Error(`Assumption already exists: ${assumption.name}`)
    }
    this.assumptions.set(assumption.name, assumption)
  }

  remove(assumption: string) {
    if (!this.assumptions.delete(assumption)) {
      throw new Error('No such assumption found: ' + assumption)
    }
  }

  get(name: string) {
    return this.assumptions.get(name)
  }

  getAll(): Assumption[] {
    return Array.from(this.assumptions.values())
  }
}
