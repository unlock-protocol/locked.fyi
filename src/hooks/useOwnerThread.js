import removeMarkdown from "remove-markdown"
import { useState, useEffect, useReducer } from "react"
import { parseNote } from "../utils/parseNote"
import LoadNote from "../utils/loadNote"

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
 *
 */
const { getItem, saveItem, destroyItem, addFile } = LoadNote()

/**
 * Opens a thread for a user!
 */
export const useOwnerThread = (identity, threadId, noteId) => {
  const [loading, setLoading] = useState(true)
  const [loadingState, setLoadingState] = useState(null)
  const [{ note, noteThread }, dispatch] = useReducer(noteReducer, {})

  useEffect(() => {
    const openNote = async () => {
      setLoading(true)
      if (!identity) {
        setLoading(false)
        return
      }
      const { item, actualThreadId } = await getItem(
        identity,
        threadId,
        noteId,
        (error, state) => {
          setLoadingState(state)
        }
      )

      dispatch({
        type: "setNote",
        note: await parseNote(item),
        noteThread: actualThreadId,
      })
      // Done loading
      setLoading(false)
    }

    openNote()
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
    await saveItem(note)
  }

  /**
   * Destroys a story
   */
  const destroy = async () => {
    await destroyItem()
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
    loadingState,
  }
}

export default useOwnerThread
