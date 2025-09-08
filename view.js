import onChange from 'on-change'

export const initView = (elements, state) => {
  const watchedState = onChange(state, function(path, value) {
    if (path === 'form.status') {
      const input = elements.rssInput
      if (value === 'invalid') {
        input.classList.add('is-invalid')
      } else {
        input.classList.remove('is-invalid')
      }
      if (value === 'valid') {
        input.value = ''
        input.focus()
      }
    }
  })
  return watchedState
}
