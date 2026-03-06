import { atom, imp } from '../syntax/Formula'
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

export function createDefaultRuleRegistry(): RuleRegistry {
  const registry = new RuleRegistry()

  // default rules

  // MP
  registry.register({
    name: 'MP',
    premises: [atom('?P'), imp(atom('?P'), atom('?Q'))],
    conclusion: atom('?Q'),
  })

  // CP

  // HS

  //

  return registry
}
