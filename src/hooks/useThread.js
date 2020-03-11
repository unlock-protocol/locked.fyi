import { useState, useEffect } from 'react'
import Box from '3box'

/**
 * Yields the thread
 * @param {*} lockAddress
 * @param {*} userAddress
 */
export const useThread = (threadAddress) => {
  const [loading, setLoading] = useState(true)
  const [thread, setThread] = useState(null)

  useEffect(() => {
    const openSpace = async () => {
      const thread = await Box.getThreadByAddress(threadAddress)
      setThread(thread.reverse())
      setLoading(false)
    }

    openSpace()
  }, [threadAddress])

  return {thread, loading}
}
