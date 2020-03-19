import { useState, useEffect } from 'react'
import FrontMatter from 'front-matter'

/**
 * Yields the thread
 * @param {*} lockAddress
 * @param {*} userAddress
 */
export const useNote = (thread, index) => {
  const [loading, setLoading] = useState(true)
  const [note, setNote] = useState(null)

  useEffect(() => {
    if(thread) {
      const item = thread[index]
      const note = FrontMatter(item.message)
      setNote(note)
      setLoading(false)
    }
  }, [index, thread])

  return {note, loading}
}
