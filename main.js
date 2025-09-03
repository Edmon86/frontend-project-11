import 'bootstrap/dist/css/bootstrap.min.css'

const form = document.getElementById('rss-form')
const input = document.getElementById('rss-url')
const feedsContainer = document.getElementById('feeds')

form.addEventListener('submit', (e) => {
  e.preventDefault()
  const url = input.value
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('Ошибка сети')
      }
      return response.text()
    })
    .then(str => new window.DOMParser().parseFromString(str, 'text/xml'))
    .then(data => {
      const items = Array.from(data.querySelectorAll('item'))
      feedsContainer.innerHTML = items.map(item => `<div class="mb-2"><h5>${item.querySelector('title').textContent}</h5><p>${item.querySelector('description').textContent}</p></div>`).join('')
    })
    .catch(err => {
      console.error(err)
      alert('Не удалось загрузить RSS')
    })
})
