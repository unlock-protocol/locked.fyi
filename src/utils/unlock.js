export const Unlock = () => {
  let unlockScript
  let eventHandler

  /**
   * Invoked to load script
   * @param {*} _eventHandler
   */
  const loadScript = (locks, _eventHandler) => {
    // Sets the config
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

    // Sets listener
    eventHandler = _eventHandler
    window.addEventListener("unlockProtocol", eventHandler)
    unlockScript = document.createElement("script")
    unlockScript.src =
      "https://paywall.unlock-protocol.com/static/unlock.latest.min.js"
    document.head.appendChild(unlockScript)
  }

  /**
   * Invoked to remove script (and handler)
   */
  const unloadScrcipt = () => {
    window.removeEventListener("unlockProtocol", eventHandler)
    document.head.removeChild(unlockScript)
    delete window.unlockProtocolConfig
  }

  /**
   * Opens the checkout modal
   */
  const loadCheckout = () => {
    console.log("HAHAHA")
    window.unlockProtocol.loadCheckoutModal()
  }

  return {
    loadScript,
    unloadScrcipt,
    loadCheckout,
  }
}

export default Unlock
