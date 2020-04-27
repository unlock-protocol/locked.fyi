import { useState, useEffect } from "react"
import { Unlock } from "../utils/unlock"

const { loadScript, unloadScript, loadCheckout } = Unlock()

export const useLocks = (locks = []) => {
  const [loading, setLoading] = useState(true)
  const [locked, setLocked] = useState(true)

  useEffect(() => {
    if (!locks || !locks.length) {
      setLocked(false)
      setLoading(false)
      return
    }

    const eventHandler = (event) => {
      setLocked(event.detail === "locked")
      setLoading(false)
    }

    loadScript(locks, eventHandler)

    // eslint-disable-next-line consistent-return
    return () => {
      unloadScript()
    }
  }, [locks])
  return { loading, locked, loadCheckout }
}

export default useLocks
