import { useState, useEffect } from "react"

export const useLocks = (locks = []) => {
  const [loading, setLoading] = useState(true)
  const [locked, setLocked] = useState(true)

  const unlock = () => {
    window.unlockProtocol.loadCheckoutModal()
  }

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

    // Sets listener
    window.addEventListener("unlockProtocol", eventHandler)

    // resets the config
    window.unlockProtocolConfig = {
      locks: locks.reduce(
        (acc, x) => ({
          ...acc,
          [x]: {},
        }),
        {}
      ),
      callToAction: {
        default: "The content of this note is locked.",
        confirmed: "Thank for your membership!",
      },
    }

    // Load the script, which we'll remove when we unmount
    const unlockScript = document.createElement("script")
    unlockScript.src =
      "https://paywall.unlock-protocol.com/static/unlock.latest.min.js"
    document.head.appendChild(unlockScript)

    // eslint-disable-next-line consistent-return
    return () => {
      window.removeEventListener("unlockProtocol", eventHandler)
      document.head.removeChild(unlockScript)
    }
  }, [locks])
  return { loading, locked, unlock }
}

export default useLocks
