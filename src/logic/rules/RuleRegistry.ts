import { AppError } from '../proof/AppError'
import { atom, imp, not, type Formula } from '../syntax/Formula'
import { FormulaRegistry } from './FormulaRegistry'
import type { InferenceRule } from './InferenceRule'

export class RuleRegistry extends FormulaRegistry<InferenceRule> {
  formulas = new Map<string, InferenceRule>()

  static from(...rules: InferenceRule[]): RuleRegistry {
    const registry = new RuleRegistry()
    rules.forEach((r) => registry.tryadd(r))
    return registry
  }

  add(rule: InferenceRule) {
    const name = rule.name
    if (this.formulas.has(name)) {
      throw new AppError('feedback.errors.registries.rule_exists', { name })
    }
    this.formulas.set(name, rule)
  }

  tryadd(rule: InferenceRule): boolean {
    if (this.formulas.has(rule.name)) {
      return false
    }
    this.add(rule)
    return true
  }

  remove(name: string) {
    if (!this.formulas.delete(name)) {
      throw new AppError('feedback.errors.registries.rule_not_found', { name })
    }
  }

  tryremove(rule: string): boolean {
    return this.formulas.delete(rule)
  }

  get(name: string) {
    return this.formulas.get(name)
  }

  getAll(): InferenceRule[] {
    return Array.from(this.formulas.values())
  }

  static defaultRegistry(extedned: boolean): RuleRegistry {
    const F = atom('?F')
    const G = atom('?G')
    const H = atom('?H')

    if (!extedned)
      return RuleRegistry.from({
        name: 'MP',
        premises: [F, imp(F, G)],
        conclusion: G,
      })

    return RuleRegistry.from(
      // MP
      {
        name: 'MP',
        premises: [F, imp(F, G)],
        conclusion: G,
      },

      // HS
      {
        name: 'HS',
        premises: [imp(F, G), imp(G, H)],
        conclusion: imp(F, H),
      },

      // CPi
      {
        name: 'CPi',
        premises: [imp(F, G)],
        conclusion: imp(not(G), not(F)),
      },

      //CPe
      {
        name: 'CPe',
        premises: [imp(not(F), not(G))],
        conclusion: imp(G, F),
      },

      //¬¬e
      {
        name: '¬¬e',
        premises: [not(not(F))],
        conclusion: F,
      },

      //¬¬→
      {
        name: '¬¬→',
        premises: [],
        conclusion: imp(not(not(F)), F),
      },

      //¬¬i
      {
        name: '¬¬i',
        premises: [F],
        conclusion: not(not(F)),
      },

      //→¬¬
      {
        name: '→¬¬',
        premises: [],
        conclusion: imp(F, not(not(F))),
      },

      //MT
      {
        name: 'MT',
        premises: [imp(F, G), not(G)],
        conclusion: not(F),
      },
    )
  }
}
