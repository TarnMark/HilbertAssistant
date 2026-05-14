import type { Formula } from '../syntax/Formula'

export type Justification =
  | { kind: 'axiom'; name: string }
  | { kind: 'rule'; name: string; from: number[] }
  | { kind: 'assumption'; name: string }

export function formatJustification(j: Justification): string {
  switch (j.kind) {
    case 'assumption':
      return j.name
    case 'axiom':
      return `Axiom ${j.name}`
    case 'rule':
      return `${j.name} ${j.from.map((n) => n + 1).join(', ')}`
  }
}

export type VisualJustification = {
  name: string
  formula: string
  category: 'assumption' | 'axiom' | 'rule'
  inputs?: Formula[]
}

export function toJust(visual: VisualJustification, from?: number[]): Justification {
  switch (visual.category) {
    case 'assumption':
      return { kind: 'assumption', name: visual.name }
    case 'axiom':
      return {
        kind: 'axiom',
        name: visual.name,
      }
    case 'rule':
      return {
        kind: 'rule',
        name: visual.name,
        from: from ?? [],
      }
  }
}

export function parseJustification(s: string): Justification {
  s = s.trim()

  if (s.startsWith('Axiom ')) {
    return {
      kind: 'axiom',
      name: s.slice(6).trim(),
    }
  }

  const ruleMatch = s.match(/^(.*)\s+(\d+(?:,\s*\d+)*)$/)

  if (ruleMatch) {
    const [, name, nums] = ruleMatch

    return {
      kind: 'rule',
      name: name!.trim(),
      from: nums!.split(',').map((n) => parseInt(n.trim()) - 1),
    }
  }

  return {
    kind: 'assumption',
    name: s,
  }
}
