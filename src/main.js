import 'bootstrap/dist/css/bootstrap.min.css'
import i18n from './i18n.js'
import './style.css'
import { Modal } from 'bootstrap'
import parseRss from './parseRss.js'
import { createUrlSchema } from './validation.js'
import { initView } from './view.js'

// DOM элементы
const elements = {
  rssInput: document.getElementById('url-input'),
  feedback: document.querySelector('.feedback'),
  feedsContainer: document.querySelector('.feeds'),
  postsContainer: document.querySelector('.posts'),
  modalEl: document.getElementById('postModal'),
  modalTitle: document.getElementById('modalTitle'),
  modalBody: document.getElementById('modalBody'),
  modalLink: document.querySelector('.full-article'),
  postModal: null,
  readPosts: new Set(),
  i18n,
}

elements.postModal = new Modal(elements.modalEl)

// Состояние приложения
const state = {
  feeds: [],
  posts: [],
  readPosts: elements.readPosts,
  form: { status: null },
}

// Инициализация view
const watchedState = initView(elements, state)

// Функция fetch через Hexlet proxy с обработкой сети
const fetchRss = (url) => fetch(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
  .then((res) => {
    if (!res.ok) throw new Error('network')
    return res.json()
  })
  .then(({ contents }) => {
    let xmlText = contents
    if (xmlText.startsWith('data:application/rss+xml')) {
      const base64 = xmlText.split(',')[1]
      xmlText = atob(base64)
    }
    return xmlText
  })
  .catch((err) => {
    // Если вдруг fetch упал из-за сети - превращаем ошибку в network
    if (err instanceof TypeError) {
      throw new Error('network')
    }
    throw err
  })

// Добавление RSS
document.getElementById('rss-form').addEventListener('submit', (e) => {
  e.preventDefault()
  const url = elements.rssInput.value.trim()
  const schema = createUrlSchema(state.feeds)

  schema.validate(url)
    .then(() => {
      if (state.feeds.some((f) => f.url === url)) {
        watchedState.form.status = 'exists'
        return null
      }

      return fetchRss(url)
        .then((xmlText) => {
          const { feed, posts } = parseRss(xmlText, url)
          watchedState.feeds = [...state.feeds, feed]
          watchedState.posts = [...state.posts, ...posts]
          watchedState.form.status = 'valid'
        })
        .catch((err) => {
          if (err.message === 'network') {
            watchedState.form.status = 'network'
          }
          else {
            watchedState.form.status = 'parseError'
          }
        })
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        if (err.message === i18n.t('errors.required')) {
          watchedState.form.status = 'required'
        }
        else if (err.message === i18n.t('errors.invalidUrl')) {
          watchedState.form.status = 'invalid'
        }
        else if (err.message === i18n.t('errors.alreadyExists')) {
          watchedState.form.status = 'exists'
        }
      }
      else {
        watchedState.form.status = 'parseError'
      }
    })
})

// Автообновление постов
const updateFeeds = () => {
  state.feeds.forEach((feed) => {
    fetchRss(feed.url)
      .then((xmlText) => {
        const { posts } = parseRss(xmlText, feed.url)
        const newPosts = posts.filter((p) => !state.posts.some((existing) => existing.link === p.link))
        if (newPosts.length > 0) {
          watchedState.posts = [...state.posts, ...newPosts]
          console.log(`Добавлено ${newPosts.length} новых постов из ${feed.title}`)
        }
      })
      .catch((err) => {
        if (err.message === 'network') {
          console.warn(`Ошибка сети при обновлении фида ${feed.url}`)
        }
        else {
          console.warn(`Ошибка обновления фида ${feed.url}:`, err.message)
        }
      })
  })

  setTimeout(updateFeeds, 5000)
}

updateFeeds()
