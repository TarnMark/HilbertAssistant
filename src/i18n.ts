import { createI18n } from 'vue-i18n'

import enStartup from '../locales/en/startup.json'
import enMain from '../locales/en/main.json'
import enFeedback from '../locales/en/feedback.json'

import etStartup from '../locales/et/startup.json'
import etMain from '../locales/et/main.json'
import etFeedback from '../locales/et/feedback.json'

export const i18n = createI18n({
  legacy: false, // use Composition API
  locale: localStorage.getItem('lang') ?? 'et',
  fallbackLocale: 'en',
  messages: {
    en: {
      startup: enStartup,
      main: enMain,
      feedback: enFeedback,
    },
    et: {
      startup: etStartup,
      main: etMain,
      feedback: etFeedback,
    },
  },
})
