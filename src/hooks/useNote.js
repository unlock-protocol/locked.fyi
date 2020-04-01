import { useState, useEffect } from "react"

/**
 * Yields the note
 * @param {*} lockAddress
 * @param {*} userAddress
 */
export const useNote = (thread, index) => {
  const [loading, setLoading] = useState(true)
  const [note, setNote] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (thread) {
      const item = thread.find(
        (_item) => _item.note.attributes.id.toString() === index
      )
      if (item) {
        setNote(item.note)
        setLoading(false)
      } else {
        setError("Note not found!")
      }
    }
  }, [index, thread])

  return { note, loading, error }
}

export default useNote
