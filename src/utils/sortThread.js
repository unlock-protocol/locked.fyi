import { parseNote } from "./parseNote"

export const sortThread = (thread) => {
  const inflatedThead = thread.map((item) => ({
    ...item,
    note: parseNote(item),
  }))
  return inflatedThead.sort(
    (item1, item2) =>
      item1.note &&
      item1.note.attributes &&
      item2.note &&
      item2.note.attributes &&
      item1.note.attributes.createdAt <= item2.note.attributes.createdAt
  )
}

export default sortThread
