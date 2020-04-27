import SimplePeer from "simple-peer"
import Box from "3box"
import { useState, useEffect } from "react"
import { Unlock } from "../utils/unlock"

import { defaultLock } from "../components/Note"

const { loadScript, loadCheckout } = Unlock()

export const states = {
  OPENING_BOX: "OPENING_BOX",
  OPENING_SPACE: "OPENING_SPACE",
  WAITING_FOR_SIGNAL: "WAITING_FOR_SIGNAL",
  WAITING_FOR_UNLOCK: "WAITING_FOR_UNLOCK",
  CONNECTING_TO_STREAM: "CONNECTING_TO_STREAM",
  CONNECTED: "CONNECTED",
}

export const useLive = (address, identity) => {
  const [state, setState] = useState(true)

  useEffect(() => {
    const watch = async () => {
      setState(states.OPENING_BOX)
      const box = await Box.openBox(identity, window.ethereum)

      setState(states.OPENING_SPACE)
      const liveSpace = await box.openSpace("locked-fyi/live")

      const thread = await liveSpace.joinThread("viewers", {
        ghost: true,
      })

      thread.onUpdate(async (update) => {
        if (update.type === "chat" && update.message.from === address) {
          if (update.message.type === "up") {
            // The broadcaster joined the thread!
            thread.post({
              from: identity,
              type: "ping",
            })
          } else if (
            update.message.type === "ping" &&
            update.message.to === identity
          ) {
            // This is a response!
            onPingResponse(update.message, (signal) => {
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

      setState(states.WAITING_FOR_SIGNAL)

      // The thread is used for signaling
      // 1. When we load this page, we post to it for the address
      // TODO: security: encrypt with address to ensure that only the broadcaster can respond to it
      // 2. The broadcaster will create a new Peer on their end and send us back the `signal`
      // 3. once we have the signal, we will create a peer here and post the signal to it
      // 4. the broadcaster's peer will then respond to it and start sending the video stream

      const onPingResponse = async ({ signal, locks }, respond) => {
        const paywallLocks = []
        if (locks.length === 0) {
          paywallLocks.push(defaultLock)
        } else {
          paywallLocks.push(...locks)
        }

        loadScript(paywallLocks, (event) => {
          if (event.detail === "locked") {
            setState(states.WAITING_FOR_UNLOCK)
            loadCheckout()
          } else {
            setState(states.CONNECTING_TO_STREAM)

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
              setState(states.CONNECTED)
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
        })
      }
    }
    watch()
  }, [address, identity])

  return { state }
}

export default useLive
