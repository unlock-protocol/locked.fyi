import SimplePeer from "simple-peer"
import Box from "3box"
import { useState, useEffect } from "react"

export const useLive = (address, identity) => {
  const [loading, setLoading] = useState(true)

  const watch = async () => {
    const box = await Box.openBox(identity, window.ethereum)
    const broadcasterSpace = await Box.getSpace(address, "locked-fyi/live")
    const liveSpace = await box.openSpace("locked-fyi/live")

    const { signal } = broadcasterSpace

    const thread = await liveSpace.joinThread("viewers", {
      ghost: true,
    })

    // Connect to the stream on this page.
    const peer = new SimplePeer({
      initiator: false,
      trickle: false,
    })

    peer.signal(signal)
    console.log({
      signal,
    })

    peer.on("error", (err) => console.log("error", err))

    peer.on("signal", async (data) => {
      // We should save this to 3box!
      // Because this will be used by others
      console.log("SIGNAL", JSON.stringify(data))
      document.querySelector("#outgoing").textContent = JSON.stringify(data)
      await thread.post(data)
    })

    //
    document.querySelector("form").addEventListener("submit", (ev) => {
      ev.preventDefault()
    })

    // Once connected!
    peer.on("connect", () => {
      console.log("CONNECT")
      peer.send(`whatever${Math.random()}`)
    })

    // If we get data
    peer.on("data", (data) => {
      console.log(`data: ${data}`)
      peer.send(`Heard you!${Math.random()}`)
    })
  }

  useEffect(() => {
    setLoading(false)
    watch()
  }, [address])

  return { loading }
}

export default useLive
