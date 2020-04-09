import Box from "3box"
import { useState, useEffect } from "react"
import { parseNote } from "../utils/parseNote"

/**
 * Yields the note
 * @param {*} lockAddress
 * @param {*} userAddress
 */
export const useNote = (address, page, index) => {
  const [loading, setLoading] = useState(true)
  const [note, setNote] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadNote = async () => {
      // Let's load the space, the thread and then the note!
      try {
        const thread = await Box.getThread("locked", page, address, true)
        const foundItem = thread.find((item) => {
          const parsedNote = parseNote(item)
          return parsedNote.attributes.id.toString() === index
        })
        if (foundItem) {
          setNote(parseNote(foundItem))
          setLoading(false)
          return
        }
        setError("Note not found!")
      } catch (err) {
        setError("Note not found!")
      }
      setLoading(false)
    }
    loadNote()
  }, [address, page, index])

  return { note, loading, error }
}

export default useNote
