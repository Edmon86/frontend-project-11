import * as yup from 'yup'

// Функция возвращает схему валидации URL
export const createUrlSchema = (feeds) => yup.string()
  .url('Ссылка должна быть валидной')
  .notOneOf(feeds, 'RSS уже существует')
  .required('Поле не должно быть пустым')
