import {parseNote} from './parseNote'


export const sortThread = (thread) => {
  const inflatedThead = thread.map((item) => ({
    ...item,
    note: parseNote(item)
  }))
  return inflatedThead.sort((item1, item2) =>
    item1.note?.attributes?.createdAt <= item2.note?.attributes?.createdAt
  )
}