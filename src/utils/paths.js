export const threadPath = (address) => {
  return `/notes/${address}`
}

export const notePath = (address, noteId) => {
  return `/notes/${address}/${noteId}`
}

export const writePath = (noteId) => {
  if (noteId) {
    return `/notes/write?note=${noteId}`
  }
  return `/notes/write`
}

export default {
  threadPath,
  notePath,
}
