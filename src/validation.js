import * as yup from 'yup'
import i18n from './i18n.js'

export const createUrlSchema = feeds => yup.string()
  .required(i18n.t('errors.required'))
  .url(i18n.t('errors.invalidUrl'))
  .notOneOf(feeds.map(f => f.url), i18n.t('errors.alreadyExists'))
