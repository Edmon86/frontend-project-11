import 'bootstrap/dist/css/bootstrap.min.css'
import * as yup from 'yup'
import i18n from './i18n.js'
import './style.css'
import { Modal } from 'bootstrap'
import { fetchRss } from './fetchRss.js'

// DOM элементы
const form = document.getElementById('rss-form')
const input = document.getElementById('url-input')
const feedback = document.querySelector('.feedback')
const feedsContainer = document.querySelector('.feeds')
const postsContainer = document.querySelector('.posts')

const modalEl = document.getElementById('postModal')
const modalTitle = document.getElementById('modalTitle')
const modalBody = document.getElementById('modalBody')
const modalLink = document.querySelector('.full-article')
const postModal = new Modal(modalEl)

// Состояние приложения
const state = {
  feeds: [],
  posts: [],
  readPosts: new Set(),
}

// Настройка yup + i18n
yup.setLocale({
  string: { url: () => i18n.t('errors.invalidUrl') },
  mixed: {
    required: () => i18n.t('errors.required'),
    notOneOf: () => i18n.t('errors.alreadyExists'),
  },
})

const createUrlSchema = (feeds) =>
  yup.string().url().notOneOf(feeds.map((f) => f.url)).required()

// Парсер RSS
const parseRss = (rssText, url) => {
  const parser = new DOMParser()
  const xml = parser.parseFromString(rssText, 'text/xml')

  if (xml.querySelector('parsererror')) throw new Error('parseError')

  const feedId = crypto.randomUUID()
  const feed = {
    id: feedId,
    title: xml.querySelector('channel > title')?.textContent || 'Без названия',
    description: xml.querySelector('channel > description')?.textContent || '',
    url,
  }

  const posts = Array.from(xml.querySelectorAll('item')).map((item) => ({
    id: crypto.randomUUID(),
    feedId,
    title: item.querySelector('title')?.textContent || 'Без названия',
    link: item.querySelector('link')?.textContent || '#',
    description: item.querySelector('description')?.textContent || '',
  }))

  return { feed, posts }
}

// Рендер фидов
const renderFeeds = (feeds) => {
  feedsContainer.innerHTML = `
    <h2>Фиды</h2>
    <ul class="list-group mb-4">
      ${feeds
    .map(
      (feed) => `
        <li class="list-group-item">
          <h3>${feed.title}</h3>
          <p>${feed.description}</p>
        </li>
      `,
    )
    .join('')}
    </ul>
  `
}

// Рендер постов
const renderPosts = (posts) => {
  postsContainer.innerHTML = `
    <h2>Посты</h2>
    <ul class="list-group mb-4">
      ${posts
    .map(
      (post) => `
        <li class="list-group-item d-flex justify-content-between align-items-start">
          <a 
            href="${post.link}" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="${state.readPosts.has(post.id) ? 'fw-normal' : 'fw-bold'}"
            data-id="${post.id}"
          >
            ${post.title}
          </a>
          <button 
            type="button" 
            class="btn btn-outline-primary btn-sm ms-3 preview-btn" 
            data-id="${post.id}"
          >
            Просмотр
          </button>
        </li>
      `,
    )
    .join('')}
    </ul>
  `

  // Обработчики кнопок "Просмотр"
  postsContainer.querySelectorAll('.preview-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const postId = e.target.dataset.id
      const post = state.posts.find((p) => p.id === postId)
      if (!post) return

      state.readPosts.add(postId)
      renderPosts(state.posts)

      modalTitle.textContent = post.title
      modalBody.textContent = post.description
      modalLink.href = post.link

      postModal.show()
    })
  })
}

// Добавление RSS
form.addEventListener('submit', (e) => {
  e.preventDefault()
  const url = input.value.trim()
  const schema = createUrlSchema(state.feeds)

  schema
    .validate(url)
    .then(() => {
      input.classList.remove('is-invalid')
      feedback.textContent = ''
      feedback.classList.remove('text-danger')

      return fetchRss(url)
    })
    .then((xmlText) => {
      const { feed, posts } = parseRss(xmlText, url)

      state.feeds.push(feed)
      state.posts.push(...posts)

      renderFeeds(state.feeds)
      renderPosts(state.posts)

      feedback.classList.add('text-success')
      feedback.textContent = i18n.t('success')

      input.value = ''
      input.focus()
    })
    .catch((err) => {
      input.classList.add('is-invalid')
      feedback.classList.remove('text-success')
      feedback.classList.add('text-danger')

      if (err.name === 'ValidationError') {
        feedback.textContent = err.message
      } else {
        feedback.textContent = i18n.t(`errors.${err.message}`, {
          defaultValue: err.message,
        })
      }
    })
})

// Автообновление постов
const updateFeeds = () => {
  const feedPromises = state.feeds.map((feed) =>
    fetchRss(feed.url)
      .then((xmlText) => {
        const { posts } = parseRss(xmlText, feed.url)

        const newPosts = posts.filter(
          (p) => !state.posts.some((existing) => existing.link === p.link),
        )

        if (newPosts.length > 0) {
          state.posts.push(...newPosts)
          renderPosts(state.posts)
          console.log(`Добавлено ${newPosts.length} новых постов из ${feed.title}`)
        }
      })
      .catch((err) => {
        console.warn(`Ошибка обновления фида ${feed.url}:`, err.message)
      }),
  )

  Promise.all(feedPromises).finally(() => setTimeout(updateFeeds, 5000))
}

updateFeeds()
