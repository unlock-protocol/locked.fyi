import { useState, useEffect } from 'react'

/**
 * Yields the note
 * @param {*} lockAddress
 * @param {*} userAddress
 */
export const useNote = (thread, index) => {
  const [loading, setLoading] = useState(true)
  const [note, setNote] = useState(null)

  useEffect(() => {
    if(thread) {
      const item = thread.find(item =>
        item.note?.attributes?.id?.toString() === index
      )
      if (item) {
        setNote(item.note)
        setLoading(false)
      } else {
        // TODO: show error!
        console.error('Item not found')
      }
    }
  }, [index, thread])

  return {note, loading}
}
