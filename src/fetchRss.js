// src/fetchRss.js

/**
 * Получение RSS по URL
 * @param {string} url - адрес RSS
 * @param {boolean} local - использовать локальный RSS (для тестов Hexlet)
 * @returns {Promise<string>} - текст XML фида
 */
export const fetchRss = (url, local = false) => {
  if (local) {
    // Для тестов Hexlet: локальный RSS лежит в /__fixtures__/rss.xml
    return fetch('/__fixtures__/rss.xml')
      .then((res) => {
        if (!res.ok) throw new Error('network')
        return res.text()
      })
  }

  // Реальный интернет
  return fetch(`https://api.allorigins.win/get?disableCache=true&url=${encodeURIComponent(url)}`)
    .then((response) => {
      if (!response.ok) throw new Error('network')
      return response.json()
    })
    .then(({ contents }) => {
      let xmlText = contents
      // Если RSS приходит в формате base64
      if (xmlText.startsWith('data:application/rss+xml')) {
        const base64 = xmlText.split(',')[1]
        xmlText = atob(base64)
      }
      return xmlText
    })
}
