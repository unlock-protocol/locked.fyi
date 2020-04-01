import { useState, useEffect } from "react"
import Box from "3box"
import { sortThread } from "../utils/sortThread"

export const useAddress = (address) => {
  const [thread, setThread] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const openSpace = async () => {
      try {
        const lockedFyiThread = await Box.getThread(
          "locked",
          "fyi",
          address,
          true
        )
        setThread(sortThread(lockedFyiThread))
      } catch (e) {
        setThread([])
      }
      setLoading(false)
    }
    openSpace()
  }, [address])

  return { loading, thread }
}

export default useAddress
