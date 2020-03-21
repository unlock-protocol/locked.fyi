import { useState, useEffect} from 'react'
import {sortThread} from '../utils/sortThread'

import Box from '3box'

export const useAddress = (address, index) => {
  const [thread, setThread] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const openSpace = async () => {
      const thread = await Box.getThread('locked', 'fyi', address, true)
      setThread(sortThread(thread))
      setLoading(false)
    }
    openSpace()
  })

  return {loading, thread}
}
