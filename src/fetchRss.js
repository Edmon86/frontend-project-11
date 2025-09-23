export async function fetchRss(url) {
  // Если мы в тестовой среде (CI), читаем локальный файл
  if (process.env.NODE_ENV === 'test') {
    const response = await fetch('/__fixtures__/rss.xml')
    if (!response.ok) throw new Error('network')
    return response.text()
  }

  // Обычный код для продакшена
  const response = await fetch(
    `https://api.allorigins.win/get?disableCache=true&url=${encodeURIComponent(url)}`,
  )

  if (!response.ok) throw new Error('network')

  const data = await response.json()
  let xmlText = data.contents

  if (xmlText.startsWith('data:application/rss+xml')) {
    const base64 = xmlText.split(',')[1]
    xmlText = atob(base64)
  }

  return xmlText
}
