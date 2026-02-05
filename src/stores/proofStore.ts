// src/stores/proofStore.ts

import { defineStore } from 'pinia'
import type { ProofState, ProofStep } from '../logic' //'@logic'

export const useProofStore = defineStore('proof', {
  state: (): ProofState => ({
    steps: [],
  }),

  actions: {
    addStep(step: ProofStep) {
      this.steps.push(step)
    },

    resetProof() {
      this.steps = []
    },
  },
})
