import Box from "3box"
import { Buffer } from "buffer"
import { sortThread } from "./sortThread"
import { NOTES_SPACE_NAME } from "../constants"

/**
 * Our data model is a bit unique
 * Threads are pages, with a max size.
 * Note that due to concurrency and race conditions, a given thread may have more items in
 * it the max size.
 * Also, threads can have less stories, especially in the context of deletion.
 * We currently do not have a defragmentation capability (especially because it would break urls)
 */

const FIRST_THREAD = 1 // We start at one because it's truthy
const MAX_THREAD_SIZE = 10

/**
 * Function which yields a new note
 * @param {*} identity
 */
const createNewNote = (identity, id) => ({
  attributes: {
    id,
    title: "",
    locks: [],
    createdAt: new Date().getTime(),
    updatedAt: new Date().getTime(),
    author: `${identity}`, // Important to stringify 0xaddress (JS considers them hex numbers)
  },
  body: "",
})

/**
 * util function to build the markdown file
 * @param {*} note
 */
const buildContent = (note) => {
  const locks = (note.attributes.locks || [])
    .map(
      (lock) => `  - "${lock}"
`
    )
    .join("")
  return `---
id: ${note.attributes.id}
createdAt: ${note.attributes.createdAt || new Date().getTime()}
updatedAt: ${new Date().getTime()}
title: ${note.attributes.title}
author: "${note.attributes.author}"
locks:
${locks}
---
${note.body}`
}

/**
 * Opens a thread
 * @param {*} space
 * @param {*} threadId
 */
const openThread = async (space, threadId) => {
  return space.joinThread(threadId, {
    members: true,
  })
}

/**
 * This method selects the earliest thread with space for a new post
 * For each thread id, it opens it, check how many post are in it.
 * If there are no post, it opens the previous thread.
 * If there are too many posts, it opens the next thread, but allows
 * it to be empty
 * @param {*} space
 * @param {*} threadId
 */
const openEarliestThreadWithSpace = async (
  space,
  threadId,
  acceptEmpty = false
) => {
  const currentThread = await openThread(space, threadId)
  const size = (await currentThread.getPosts()).length
  if (size === 0 && !acceptEmpty && threadId > FIRST_THREAD) {
    return openEarliestThreadWithSpace(
      space,
      parseInt(threadId, 10) - 1,
      acceptEmpty
    )
  }
  if (size >= MAX_THREAD_SIZE) {
    return openEarliestThreadWithSpace(space, parseInt(threadId, 10) + 1, true)
  }
  return { threadId, currentThread }
}

/**
 *
 * @param {*} thread
 * @param {*} noteId
 */
const getItem = async (thread, noteId) => {
  // Let's load items in the thread
  const items = sortThread(await thread.getPosts())
  return items.find(
    (item) =>
      item.note && item.note.attributes.id.toString() === noteId.toString()
  )
}

/**
 * Opens a note which can be edited
 * By its owner.
 * @param {*} address
 * @param {*} threadId
 * @param {*} noteId
 */
export const loadNote = async (address, threadId, noteId) => {
  // TODO: support existing IPFS node?
  // https://docs.3box.io/api/auth#box-openbox-address-ethereumprovider-opts
  const box = await Box.openBox(address, window.ethereum)

  // First, open the space.
  const space = await box.openSpace(NOTES_SPACE_NAME)

  let thread
  let actualThreadId
  // If there is a threadId and a noteId, we need to open that one
  if (threadId && noteId) {
    actualThreadId = threadId
    thread = await openThread(space, threadId)
  } else {
    // If there is no note to open, let's find which thread has space.
    // starting with the highest one.
    // It's important to start with the highest to make sure we keep the notes sorted.
    const nextThread = await openEarliestThreadWithSpace(
      space,
      threadId || (await space.public.get("latestThread")) || FIRST_THREAD
    )
    actualThreadId = nextThread.threadId
    thread = nextThread.currentThread
    // Save the actual thread id for faster lookup in the future!
    await space.public.set("latestThread", actualThreadId)
  }

  // So we have the thread
  // Let's now get the item!
  let item

  if (noteId) {
    item = await getItem(thread, noteId)
  }

  if (!item) {
    // This item does not exist or could not be found
    item = {
      message: buildContent(createNewNote(address, -1)), // use id -1 for new notes!
    }
  }

  const saveNewItem = async (note, callback) => {
    const newNote = {
      ...note,
    }
    newNote.attributes.id = (await space.private.get("nextNoteId")) || 1
    await thread.post(buildContent(newNote))
    await space.private.set("nextNoteId", newNote.attributes.id + 1) // update the nextNoteId
    item = await getItem(thread, newNote.attributes.id)
    return callback()
  }

  const saveItem = async (note, callback) => {
    if (!item.postId) {
      return saveNewItem(note, callback)
    }
    await thread.deletePost(item.postId)
    await thread.post(buildContent(note))
    item = await getItem(thread, note.attributes.id)
    return callback()
  }

  const destroyItem = async (callback) => {
    await thread.deletePost(item.postId)
    return callback()
  }

  /**
   * Saves a file to IPFS and return its URL
   * @param {*} file
   */
  const addFile = async (file) => {
    const ipfs = await Box.getIPFS()
    // for some reason this does not seem to work?
    // eslint-disable-next-line no-param-reassign
    file.content = Buffer.from(await file.arrayBuffer())
    const source = await ipfs.add(file, {
      progress: (prog) => console.log(`received: ${prog}`),
    })

    return `https://ipfs.io/ipfs/${source[0].hash}`
  }

  return {
    item,
    actualThreadId,
    saveItem,
    destroyItem,
    addFile,
  }
}

export default {
  loadNote,
}
