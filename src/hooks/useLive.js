import SimplePeer from "simple-peer"
import Box from "3box"
import { useState, useEffect } from "react"

export const useLive = (address, identity) => {
  const [state, setState] = useState(true)

  useEffect(() => {
    const watch = async () => {
      setState("Opening box")
      const box = await Box.openBox(identity, window.ethereum)

      setState("Opening space")
      const liveSpace = await box.openSpace("locked-fyi/live")

      const thread = await liveSpace.joinThread("viewers", {
        ghost: true,
      })

      thread.onUpdate(async (update) => {
        // if update is for us, then, we're good!
        // if (update.)
        if (
          update.type === "chat" &&
          update.message.from === address &&
          update.message.to === identity
        ) {
          if (update.message.type === "ping") {
            // This is a response!
            onPingResponse(update.message.signal, (signal) => {
              thread.post({
                from: identity,
                type: "signal",
                signal,
              })
            })
          }
        }
      })

      thread.post({
        from: identity,
        type: "ping",
      })
      setState("Waiting for signal")

      // The thread is used for signaling
      // 1. When we load this page, we post to it for the address
      // TODO: security: encrypt with address to ensure that only the broadcaster can respond to it
      // 2. The broadcaster will create a new Peer on their end and send us back the `signal`
      // 3. once we have the signal, we will create a peer here and post the signal to it
      // 4. the broadcaster's peer will then respond to it and start sending the video stream

      const onPingResponse = (signal, respond) => {
        // Connect to the stream on this page.
        const peer = new SimplePeer({
          initiator: false,
          trickle: false,
        })
        peer.signal(signal)
        peer.on("error", (err) => console.log("error", err))
        peer.on("signal", async (data) => {
          // We should save this to 3box!
          // Post in the thread for the broadcaster to use!
          respond(data)
        })
        // Once connected!
        peer.on("connect", () => {
          setState("Connected!")
          peer.send(`I am viewing! ${Math.random()}`)
        })
        // If we get data
        peer.on("data", (data) => {
          console.log(`data: ${data}`)
          peer.send(`Heard you!${Math.random()}`)
        })
        peer.on("stream", (stream) => {
          // got remote video stream, now let's show it in a video tag
          const video = document.querySelector("video")
          setState("Started stream!")

          if ("srcObject" in video) {
            video.srcObject = stream
          } else {
            video.src = window.URL.createObjectURL(stream) // for older browsers
          }
          try {
            video.play()
          } catch (error) {
            // Autoplay disabled?
          }
        })
      }
    }
    watch()
  }, [address, identity])

  return { state }
}

export default useLive
