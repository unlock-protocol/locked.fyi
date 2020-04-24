import { useState, useEffect, useReducer } from "react"
import Box from "3box"
import { sortThread } from "../utils/sortThread"
import { NOTES_SPACE_NAME } from "../constants"

export const useAddress = (address) => {
  const [thread, dispatch] = useReducer((state, action) => {
    if (action.name === "add") {
      return [...state, ...action.notes] // TODO: sort again?
    }
    if (action.name === "reset") {
      return [] // TODO: sort again?
    }
  }, [])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const openNextThread = async (threadId, direction, done) => {
      try {
        const lockedFyiThread = await Box.getThread(
          NOTES_SPACE_NAME,
          threadId,
          address,
          true
        )
        dispatch({
          name: "add",
          notes: sortThread(lockedFyiThread, threadId).reverse(),
        })
        if (threadId > 0) {
          return openNextThread(direction(threadId), direction, done)
        }
        return done()
      } catch (error) {}
      return done()
    }

    const openSpace = async () => {
      // Reset data in reducer!
      dispatch({
        name: "reset",
      })
      const space = await Box.getSpace(address, NOTES_SPACE_NAME)
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
