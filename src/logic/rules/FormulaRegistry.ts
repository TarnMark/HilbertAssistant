export abstract class FormulaRegistry<T> {
  formulas = new Map<string, T>()

  abstract add(formula: T): void
  abstract tryadd(formula: T): boolean

  abstract remove(formula: string): void
  abstract tryremove(formula: string): boolean

  get(name: string): T | undefined {
    return this.formulas.get(name)
  }

  getAll(): T[] {
    return Array.from(this.formulas.values())
  }
}
