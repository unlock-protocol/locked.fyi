import removeMarkdown from "remove-markdown"
import { useState, useEffect, useReducer, useContext } from "react"
import { parseNote } from "../utils/parseNote"
import LoadNote from "../utils/loadNote"
import BoxContext from "../contexts/boxContext"

const noteReducer = (state, action) => {
  switch (action.type) {
    case "setNote":
      return {
        noteThread: action.noteThread,
        note: {
          ...action.note,
        },
      }
    case "setAttribute":
      return {
        ...state,
        note: {
          attributes: {
            ...state.note.attributes,
            [action.attribute]: action.value,
          },
          body: state.note.body,
        },
      }
    case "setBody":
      return {
        ...state,
        note: {
          attributes: state.note.attributes,
          body: action.body,
        },
      }
    default:
    // Un supported!
  }
  return state
}

/**
 * Opens a thread for a user!
 */
export const useOwnerThread = (identity, threadId, noteId) => {
  const [loading, setLoading] = useState(true)
  const [currentItem, setCurrentItem] = useState(null)
  const [currentThread, setCurrentThread] = useState(null)
  const [{ note, noteThread }, dispatch] = useReducer(noteReducer, {})
  const { space } = useContext(BoxContext)

  const { getItem, saveItem, destroyItem, addFile } = LoadNote(space)

  useEffect(() => {
    const openNote = async () => {
      setLoading(true)
      if (!identity) {
        setLoading(false)
        return
      }
      const { item, thread, itemThread } = await getItem(
        identity,
        threadId,
        noteId
      )

      dispatch({
        type: "setNote",
        note: await parseNote(item),
        noteThread: itemThread,
      })
      setCurrentThread(thread)
      setCurrentItem(item)
      // Done loading
      setLoading(false)
    }

    openNote()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identity, threadId, noteId])

  /**
   * Sets a not attribute
   * @param {*} attribute
   * @param {*} value
   */
  const setNoteAttribute = async (attribute, value) => {
    await dispatch({
      type: "setAttribute",
      attribute,
      value,
    })
  }

  /**
   * sets the note body
   * @param {*} body
   */
  const setNoteBody = async (body) => {
    // We should try to extract the title from this!
    // The title is the first line
    const firstLine = body.split("\n")[0]
    setNoteAttribute("title", removeMarkdown(firstLine))
    await dispatch({
      type: "setBody",
      body,
    })
  }

  /**
   * Saves a story
   */
  const save = async () => {
    await saveItem(currentItem, currentThread, note)
  }

  /**
   * Destroys a story
   */
  const destroy = async () => {
    await destroyItem(currentItem, currentThread)
    setCurrentItem(null) // unset the item
  }

  /**
   * Uploads a file
   * @param {*} file
   */
  const uploadFile = async (file) => {
    await addFile(file)
  }

  return {
    setNoteAttribute,
    setNoteBody,
    note,
    noteThread,
    loading,
    save,
    destroy,
    uploadFile,
  }
}

export default useOwnerThread
