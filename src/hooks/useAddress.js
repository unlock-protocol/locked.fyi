import { useState, useEffect} from 'react'
import {sortThread} from '../utils/sortThread'

import Box from '3box'

export const useAddress = (address) => {
  const [thread, setThread] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const openSpace = async () => {
      try {
        const thread = await Box.getThread('locked', 'fyi', address, true)
        setThread(sortThread(thread))
      } catch (e) {
        setThread([])
      }
      setLoading(false)
    }
    openSpace()
  }, [address])

  return {loading, thread}
}
