import Box from "3box"
import { Buffer } from "buffer"
import { sortThread } from "./sortThread"

/**
 * States
 */
const states = {
  OPENING_BOX: "OPENING_BOX",
  OPENING_SPACE: "OPENING_SPACE",
  OPENING_THREAD: "OPENING_THREAD",
  RETRIEVING_ITEM: "RETRIEVING_ITEM",
  SAVING_NEW_ITEM: "SAVING_NEW_ITEM",
  SAVING_ITEM: "SAVING_ITEM",
  DESTROYING_ITEM: "DESTROYING_ITEM",
  SAVING_FILE: "SAVING_FILE",
}

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
    draft: true,
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
draft: ${!!note.attributes.draft}
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
  const thread = await openThread(space, threadId)
  const size = (await thread.getPosts()).length
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
  return { threadId, thread }
}

/**
 *
 * @param {*} thread
 * @param {*} noteId
 */
const getItemInThread = async (thread, noteId) => {
  // Let's load items in the thread
  const items = sortThread(await thread.getPosts())
  return items.find(
    (item) =>
      item.note && item.note.attributes.id.toString() === noteId.toString()
  )
}

/**
 * Adapter to provide notes which can be edited their owner
 */
const LoadNote = (space) => {
  /**
   * Saves a note as a new item
   * @param {*} note
   * @param {*} stateCallback
   */
  const saveNewItem = async (thread, note, stateCallback = () => {}) => {
    stateCallback(null, states.SAVING_NEW_ITEM)
    const newNote = {
      ...note,
    }
    newNote.attributes.id = (await space.private.get("nextNoteId")) || 1
    await thread.post(buildContent(newNote))
    await space.private.set("nextNoteId", newNote.attributes.id + 1) // update the nextNoteId
    return getItemInThread(thread, newNote.attributes.id)
  }

  /**
   * saves a note as an item (replaces old version)
   * @param {*} item
   * @param {*} note
   * @param {*} stateCallback
   */
  const saveItem = async (item, thread, note, stateCallback = () => {}) => {
    stateCallback(null, states.SAVING_ITEM)
    if (!item.postId) {
      return saveNewItem(thread, note, stateCallback)
    }
    await thread.deletePost(item.postId)
    await thread.post(buildContent(note))
    return getItemInThread(thread, note.attributes.id)
  }

  /**
   * destroys an item
   * @param {*} item
   * @param {*} stateCallback
   */
  const destroyItem = async (item, thread, stateCallback = () => {}) => {
    stateCallback(null, states.DESTROYING_ITEM)
    await thread.deletePost(item.postId)
    return null
  }

  /**
   * Saves a file to IPFS and return its URL
   * @param {*} file
   */
  const addFile = async (file, stateCallback = () => {}) => {
    stateCallback(null, states.SAVING_FILE)
    const ipfs = await Box.getIPFS()
    // for some reason this does not seem to work?
    // eslint-disable-next-line no-param-reassign
    file.content = Buffer.from(await file.arrayBuffer())
    const source = await ipfs.add(file, {
      progress: (prog) => console.log(`received: ${prog}`),
    })

    return `https://ipfs.io/ipfs/${source[0].hash}`
  }

  /**
   * Retrieves a note and sets the values used in other methods
   */
  const getItem = async (
    address,
    threadId,
    noteId,
    stateCallback = () => {}
  ) => {
    // TODO: support existing IPFS node?
    // https://docs.3box.io/api/auth#box-openbox-address-ethereumprovider-opts
    stateCallback(null, states.OPENING_BOX)

    let thread
    let item
    let itemThread

    // First, open the space.
    stateCallback(null, states.OPENING_SPACE)

    // If there is a threadId and a noteId, we need to open that one
    if (threadId && noteId) {
      stateCallback(null, states.OPENING_THREAD)
      thread = await openThread(space, threadId)
      itemThread = threadId
    } else {
      // If there is no note to open, let's find which thread has space.
      // starting with the highest one.
      // It's important to start with the highest to make sure we keep the notes sorted.
      stateCallback(null, states.OPENING_THREAD)
      const nextThread = await openEarliestThreadWithSpace(
        space,
        threadId || (await space.public.get("latestThread")) || FIRST_THREAD
      )
      thread = nextThread.thread
      itemThread = nextThread.threadId
      // Save the actual thread id for faster lookup in the future!
      await space.public.set("latestThread", itemThread)
    }

    if (noteId) {
      stateCallback(null, states.RETRIEVING_ITEM)
      item = await getItemInThread(thread, noteId)
    }

    if (!item) {
      // This item does not exist or could not be found
      item = {
        message: buildContent(createNewNote(address, -1)), // use id -1 for new notes!
      }
    }
    return { item, thread, itemThread }
  }

  return {
    getItem,
    saveItem,
    destroyItem,
    addFile,
  }
}

export default LoadNote
