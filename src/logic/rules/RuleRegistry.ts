import { atom, imp, not } from '../syntax/Formula'
import type { InferenceRule } from './InferenceRule'

export class RuleRegistry {
  rules = new Map<string, InferenceRule>()

  register(rule: InferenceRule) {
    if (this.rules.has(rule.name)) {
      throw new Error('Rule already exists: ${rule.name}')
    }
    this.rules.set(rule.name, rule)
  }

  remove(rule: string) {
    if (!this.rules.delete(rule)) {
      throw new Error('No such rule found: ' + rule)
    }
  }

  get(name: string) {
    return this.rules.get(name)
  }

  getAll(): InferenceRule[] {
    return Array.from(this.rules.values())
  }
}

export function createDefaultRuleRegistry(extended: boolean): RuleRegistry {
  const registry = new RuleRegistry()

  const F = atom('?F')
  const G = atom('?G')
  const H = atom('?H')

  // default rules

  // MP
  registry.register({
    name: 'MP',
    premises: [F, imp(F, G)],
    conclusion: G,
  })

  if (!extended) return registry

  // HS
  registry.register({
    name: 'HS',
    premises: [imp(F, G), imp(G, H)],
    conclusion: imp(F, H),
  })

  // CPi
  registry.register({
    name: 'CPi',
    premises: [imp(F, G)],
    conclusion: imp(not(G), not(F)),
  })

  //CPe
  registry.register({
    name: 'CPe',
    premises: [imp(not(F), not(G))],
    conclusion: imp(G, F),
  })

  //¬¬e
  registry.register({
    name: '¬¬e',
    premises: [not(not(F))],
    conclusion: F,
  })

  //¬¬→
  registry.register({
    name: '¬¬→',
    premises: [],
    conclusion: imp(not(not(F)), F),
  })

  //¬¬i
  registry.register({
    name: '¬¬i',
    premises: [F],
    conclusion: not(not(F)),
  })

  //→¬¬
  registry.register({
    name: '→¬¬',
    premises: [],
    conclusion: imp(F, not(not(F))),
  })

  //MT
  registry.register({
    name: 'MT',
    premises: [imp(F, G), not(G)],
    conclusion: not(F),
  })

  return registry
}
