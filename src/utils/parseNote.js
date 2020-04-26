import FrontMatter from "front-matter"

const defaultAttributes = {
  id: new Date().getTime(), // Good enough unique id per story?
  title: "",
  author: "",
  preview: "",
  draft: false,
  createdAt: new Date().getTime(),
  updatedAt: new Date().getTime(),
  locks: [],
}

export const parseNote = (item) => {
  const note = FrontMatter(item.message)
  const formattedNote = {
    body: note.body,
    attributes: {
      ...defaultAttributes,
      ...(note.attributes || {}),
    },
  }
  return formattedNote
}

export default parseNote
