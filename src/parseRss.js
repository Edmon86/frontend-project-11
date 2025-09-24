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
export default parseRss
