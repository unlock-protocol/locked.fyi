import SimplePeer from "simple-peer"
import Box from "3box"
import { useState, useCallback } from "react"
import { isUnlocked } from "@unlock-protocol/paywall"

const readOnlyProvider = "https://cloudflare-eth.com/"
const locksmithUri = "https://locksmith.unlock-protocol.com/"

export const useBroadcast = (address, locks) => {
  console.log(locks)
  const [state, setState] = useState(null)
  const [viewersCount, setViewersCount] = useState(0)
  const [playing, setPlaying] = useState(false)

  const goLive = useCallback(async () => {
    setState("Accessing webcam")

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    })

    const video = document.querySelector("video")
    video.srcObject = stream
    video.play()
    setPlaying(true)

    setState("Opening box")

    const box = await Box.openBox(address, window.ethereum)

    setState("Opening space")

    const space = await box.openSpace("locked-fyi/live")

    setState("Opening thread")

    const thread = await space.joinThread("viewers", {
      ghost: true,
    })

    // There is probably going to be a limit to the number of peers!
    const peers = {}

    // Handling connection requests
    // We could verify key ownership here!
    thread.onUpdate(async (update) => {
      if (update.type === "chat" && update.message) {
        if (update.message.type === "ping" && update.message.from !== address) {
          onPing(update, (signal) => {
            thread.post({
              from: address,
              to: update.message.from,
              type: "ping",
              signal,
              locks,
            })
          })
        } else if (update.message.type === "signal") {
          onSignal(update)
        }
      }
    })

    // Inform that we joined!
    thread.post({
      from: address,
      type: "up",
    })

    setState("Ready")

    const onSignal = async (post) => {
      const unlocked = await isUnlocked(
        post.message.from,
        { locks },
        {
          readOnlyProvider,
          locksmithUri,
        }
      )
      console.log(unlocked)
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
      peer.on("error", () => {
        // Let's assume the peer was terminated.
        setViewersCount(viewersCount - 1)
        peer.destroy()
        delete peers[post.message.from]
      })

      // Signaling thru the 3box space so that viewers can connect
      peer.on("signal", (signal) => {
        // We need to post back the signal to this user!
        respond(signal)
      })

      // Once connected!
      peer.on("connect", () => {
        setViewersCount(viewersCount + 1)
      })

      // If we get data (use for chat backchannel?s)
      // peer.on("data", (data) => {
      //   //
      // })

      peers[post.message.from] = peer
    }
  })

  return { goLive, state, viewersCount, playing }
}

export default useBroadcast
