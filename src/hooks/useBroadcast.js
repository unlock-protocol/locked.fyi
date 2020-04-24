import SimplePeer from "simple-peer"
import Box from "3box"
import { useState, useEffect } from "react"

export const useBroadcast = (address) => {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const goLive = async () => {
      // Flow:
      // When the owner connects, they should pick a lock
      // Then, we create a stream and store the `offer` + lock address inside of the 3box storage
      // Then, we wait!

      // On the other end, when we load the page, we look for an offer in IPFS.
      // If there is one, we try to connect to it and then we send the answer in the "ghost" thread.

      const box = await Box.openBox(address, window.ethereum)
      const space = await box.openSpace("locked-fyi/live")

      const thread = await space.joinThread("viewers", {
        ghost: true,
      })

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })

      // There is probably going to be a limit to the number of peers!
      const peers = {}

      // Handling connection requests
      // We could verify key ownership here!
      thread.onUpdate(async (update) => {
        if (update.type === "chat" && update.message) {
          if (
            update.message.type === "ping" &&
            update.message.from !== address
          ) {
            console.log("GOT PING")
            onPing(update, (signal) => {
              thread.post({
                from: address,
                to: update.message.from,
                type: "ping",
                signal,
              })
            })
          } else if (update.message.type === "signal") {
            onSignal(update)
          }
        }
      })
      console.log("READY")

      const onSignal = (post) => {
        const peer = peers[post.message.from]
        peer.signal(post.message.signal)
      }

      const onPing = (post, respond) => {
        // Ok, let's create a new Peer for this user!
        // Connect to the stream on this page.
        const peer = new SimplePeer({
          initiator: true, // TODO: Initiator should be signer of the address!
          stream,
          trickle: false,
        })
        peer.on("error", (err) => console.log("error", err))

        // Signaling thru the 3box space so that viewers can connect
        peer.on("signal", (signal) => {
          // We need to post back the signal to this user!
          respond(signal)
          console.log("SIGNAL", JSON.stringify(signal))
        })

        // Once connected!
        peer.on("connect", () => {
          console.log("CONNECTED")
          peer.send(`whatever${Math.random()}`)
        })

        // If we get data
        peer.on("data", (data) => {
          console.log(`DATA: ${data}`)
        })

        peers[post.message.from] = peer
      }
    }
    setLoading(false)
    goLive()
  }, [address])

  return { loading }
}

export default useBroadcast
