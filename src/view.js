import onChange from 'on-change'

export const initView = (elements, state) => {
  const watchedState = onChange(state, (path, value) => {
    const { rssInput, feedback, i18n, feedsContainer, postsContainer, postModal, modalTitle, modalBody, modalLink, readPosts } = elements

    if (path === 'form.status') {
      rssInput.classList.remove('is-invalid')
      feedback.textContent = ''
      feedback.classList.remove('text-danger', 'text-success')

      switch (value) {
      case 'valid':
        rssInput.value = ''
        rssInput.focus()
        feedback.textContent = i18n.t('success')
        feedback.classList.add('text-success')
        break
      case 'invalid':
        rssInput.classList.add('is-invalid')
        feedback.textContent = i18n.t('errors.invalidUrl')
        feedback.classList.add('text-danger')
        break
      case 'exists':
        rssInput.classList.add('is-invalid')
        feedback.textContent = i18n.t('errors.alreadyExists')
        feedback.classList.add('text-danger')
        break
      case 'required':
        rssInput.classList.add('is-invalid')
        feedback.textContent = i18n.t('errors.required')
        feedback.classList.add('text-danger')
        break
      case 'network':
        rssInput.classList.add('is-invalid')
        feedback.textContent = i18n.t('errors.network')
        feedback.classList.add('text-danger')
        break
      case 'parseError':
        rssInput.classList.add('is-invalid')
        feedback.textContent = i18n.t('errors.parseError')
        feedback.classList.add('text-danger')
        break
      default:
        break
      }
    }

    if (path === 'feeds') {
      feedsContainer.innerHTML = `
        <h2>Фиды</h2>
        <ul class="list-group mb-3">
          ${value.map(feed => `
            <li class="list-group-item">
              <h3 class="h6">${feed.title}</h3>
              <p>${feed.description}</p>
            </li>
          `).join('')}
        </ul>
      `
    }

    if (path === 'posts') {
      postsContainer.innerHTML = `
        <h2>Посты</h2>
        <ul class="list-group mb-3">
          ${value.map(post => `
            <li class="list-group-item d-flex justify-content-between align-items-start">
              <a href="${post.link}" target="_blank" rel="noopener noreferrer" class="${readPosts.has(post.id) ? 'fw-normal' : 'fw-bold'}" data-id="${post.id}">${post.title}</a>
              <button type="button" class="btn btn-outline-primary btn-sm preview-btn" data-id="${post.id}">Просмотр</button>
            </li>
          `).join('')}
        </ul>
      `

      postsContainer.querySelectorAll('.preview-btn').forEach(btn => {
        btn.addEventListener('click', e => {
          const postId = e.target.dataset.id
          const post = value.find(p => p.id === postId)
          if (!post) return

          readPosts.add(postId)
          watchedState.posts = [...value]

          modalTitle.textContent = post.title
          modalBody.textContent = post.description
          modalLink.href = post.link
          postModal.show()
        })
      })
    }
  })

  return watchedState
}
