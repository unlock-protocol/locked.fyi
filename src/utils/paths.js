export const threadPath = (address) => {
  return `/notes/${address}`
}

export const notePath = (address, threadId, noteId) => {
  return `/notes/${address}/${threadId}/${noteId}`
}

export const writePath = (threadId, noteId) => {
  if (noteId) {
    return `/notes/write?thread=${threadId}&note=${noteId}`
  }
  return `/notes/write`
}

export default {
  threadPath,
  notePath,
}
