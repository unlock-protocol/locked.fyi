import { useState, useEffect, useReducer } from "react"
import Box from "3box"
import { sortThread } from "../utils/sortThread"

export const useAddress = (address) => {
  const [thread, addNotes] = useReducer((state, notes) => {
    return [...state, ...notes] // TODO: sort again?
  }, [])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const openNextThread = async (threadId, direction, done) => {
      try {
        const lockedFyiThread = await Box.getThread(
          "locked",
          threadId,
          address,
          true
        )
        addNotes(sortThread(lockedFyiThread, threadId).reverse())
        if (threadId > 0) {
          return openNextThread(direction(threadId), direction, done)
        }
        return done()
      } catch (error) {}
      return done()
    }

    const openSpace = async () => {
      const space = await Box.getSpace(address, "locked")
      openNextThread(
        space.latestThread,
        (x) => x - 1,
        () => setLoading(false)
      )
    }
    openSpace()
  }, [address])

  return { loading, thread }
}

export default useAddress
