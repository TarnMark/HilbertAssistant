import { AppError } from '../proof/AppError'
import type { Formula } from '../syntax/Formula'
import { FormulaRegistry } from './FormulaRegistry'

export type Assumption = {
  name: string
  formula: Formula
}

export type SerializedAssumption = {
  name: string
  formula: string
}

export class AssumptionRegistry extends FormulaRegistry<Assumption> {
  formulas = new Map<string, Assumption>()

  constructor(assumptions: Formula[]) {
    super()
    assumptions.forEach((a, i) => {
      const name = 'H' + (i + 1)
      this.formulas.set(name, { name: name, formula: a })
    })
  }

  static from(...assumptions: Assumption[]): AssumptionRegistry {
    const registry = new AssumptionRegistry([])
    assumptions.forEach((a) => registry.tryadd(a))
    return registry
  }

  add(assumption: Assumption) {
    const name = assumption.name
    if (this.formulas.has(name)) {
      throw new AppError('feedback.errors.registries.assumption_exists', { name })
    }
    this.formulas.set(name, assumption)
  }

  tryadd(assumption: Assumption): boolean {
    if (this.formulas.has(assumption.name)) {
      return false
    }
    this.add(assumption)
    return true
  }

  remove(name: string) {
    if (!this.formulas.delete(name)) {
      throw new AppError('feedback.errors.registries.assumption_not_found', { name })
    }
  }

  tryremove(formula: string): boolean {
    return this.formulas.delete(formula)
  }

  get(name: string) {
    return this.formulas.get(name)
  }

  getAll(): Assumption[] {
    return Array.from(this.formulas.values())
  }
}
