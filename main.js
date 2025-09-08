// Подключаем bootstrap и стили
import 'bootstrap/dist/css/bootstrap.min.css'
import * as yup from 'yup'
import './style.css'

// Находим элементы в DOM
const form = document.getElementById('rss-form')
const input = document.getElementById('rss-url')
const feedsContainer = document.querySelector('.feeds') // исправлено: ищем по классу
const feedback = document.querySelector('.feedback')    // абзац под формой для ошибок

const feeds = [] // массив добавленных URL

// Функция создания схемы валидации
const createUrlSchema = (feeds) => yup
  .string()
  .url('Ссылка должна быть валидной')
  .notOneOf(feeds, 'RSS уже существует')
  .required('Поле не должно быть пустым')

// Обработчик формы
form.addEventListener('submit', (e) => {
  e.preventDefault()
  const url = input.value.trim()

  const schema = createUrlSchema(feeds)

  schema.validate(url)
    .then((validUrl) => {
      input.classList.remove('is-invalid')
      feedback.textContent = '' // очищаем ошибки

      // Загружаем RSS
      fetch(validUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Ошибка сети')
          }
          return response.text()
        })
        .then((str) => new window.DOMParser().parseFromString(str, 'text/xml'))
        .then((data) => {
          const items = Array.from(data.querySelectorAll('item'))

          // Рисуем посты
          feedsContainer.innerHTML = items
            .map(
              (item) => `
                <div class="mb-2">
                  <h5>${item.querySelector('title')?.textContent || 'Без названия'}</h5>
                  <p>${item.querySelector('description')?.textContent || 'Нет описания'}</p>
                </div>
              `,
            )
            .join('')

          // Добавляем URL в список
          feeds.push(validUrl)

          // Очищаем форму
          input.value = ''
          input.focus()
        })
        .catch((err) => {
          console.error(err)
          feedback.textContent = 'Не удалось загрузить RSS'
          input.classList.add('is-invalid')
        })
    })
    .catch((err) => {
      // Ошибка валидации
      input.classList.add('is-invalid')
      feedback.textContent = err.message // показываем ошибку пользователю
      console.error(err.message)
    })
})
