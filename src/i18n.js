import i18next from 'i18next'
import ru from './locales/ru.js'

const i18n = i18next.createInstance()

await i18n.init({
  lng: 'ru',
  debug: false,
  resources: {
    ru,
  },
})

export default i18n
