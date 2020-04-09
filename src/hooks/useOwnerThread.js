import removeMarkdown from "remove-markdown"
import { useState, useEffect, useReducer } from "react"
import { parseNote } from "../utils/parseNote"
import { loadNote } from "../utils/loadNote"

const noteReducer = (state, action) => {
  switch (action.type) {
    case "setNote":
      return {
        noteThread: action.noteThread,
        save: action.save,
        destroy: action.destroy,
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
  const [{ note, save, destroy, noteThread }, dispatch] = useReducer(
    noteReducer,
    {}
  )

  useEffect(() => {
    const openNote = async () => {
      setLoading(true)
      if (!identity) {
        setLoading(false)
        return
      }
      const { item, saveItem, destroyItem, actualThreadId } = await loadNote(
        identity,
        threadId,
        noteId
      )
      dispatch({
        type: "setNote",
        note: await parseNote(item),
        save: saveItem,
        destroy: destroyItem,
        noteThread: actualThreadId,
      })
      // Done loading
      setLoading(false)
    }

    openNote()
  }, [identity, threadId, noteId])

  const setNoteAttribute = (attribute, value) => {
    dispatch({ type: "setAttribute", attribute, value })
  }

  /**
   * sets the note body
   * @param {*} body
   */
  const setNoteBody = (body) => {
    // We should try to extract the title from this!
    // The title is the first line
    const firstLine = body.split("\n")[0]
    setNoteAttribute("title", removeMarkdown(firstLine))
    dispatch({ type: "setBody", body })
  }

  return {
    setNoteAttribute,
    setNoteBody,
    note,
    noteThread,
    loading,
    save,
    destroy,
  }
}

export default useOwnerThread
