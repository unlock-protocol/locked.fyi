import FrontMatter from 'front-matter'


export const sortThread = (thread) => {
  const inflatedThead = thread.map((item) => ({
    ...item,
    note: FrontMatter(item.message)
  }))
  return inflatedThead.sort((item1, item2) =>
    item1.note?.attributes?.createdAt <= item2.note?.attributes?.createdAt
  )
}