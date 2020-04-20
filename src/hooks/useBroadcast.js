import SimplePeer from "simple-peer"
import Box from "3box"
import { useState, useEffect } from "react"

export const useBroadcast = (address) => {
  const [loading, setLoading] = useState(true)

  const goLive = async () => {
    // Flow:
    // When the owner connects, they should pick a lock
    // Then, we create a stream and store the `offer` + lock address inside of the 3box storage
    // Then, we wait!

    // On the other end, when we load the page, we look for an offer in IPFS.
    // If there is one, we try to connect to it and then we send the answer in the "ghost" thread.
    //

    const box = await Box.openBox(address, window.ethereum)
    const space = await box.openSpace("locked-fyi/live")

    const thread = await space.joinThread("viewers", {
      ghost: true,
    })

    thread.onUpdate(async () => {
      const posts = await thread.getPosts()
      const latest = posts[posts.length - 1]
    })

    // Connect to the stream on this page.
    const peer = new SimplePeer({
      initiator: true, // Initiator should be signer of the address!
      trickle: false,
    })

    peer.on("error", (err) => console.log("error", err))

    peer.on("signal", (data) => {
      // We should save this to 3box!
      // Because this will be used by others
      space.public.set("signal", data)
      console.log("SIGNAL", JSON.stringify(data))
      document.querySelector("#outgoing").textContent = JSON.stringify(data)
    })

    document.querySelector("form").addEventListener("submit", (ev) => {
      ev.preventDefault()
      peer.signal(JSON.parse(document.querySelector("#incoming").value))
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
    goLive()
  }, [address])

  return { loading }
}

export default useBroadcast
