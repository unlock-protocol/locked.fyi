import PropTypes from "prop-types"
import React, { useState, useContext } from "react"
import styled from "styled-components"
import LockPicker from "./LockPicker"
import { IdentityContext, Button } from "./Layout"
import { useBroadcast } from "../hooks/useBroadcast"
import { useLive, states } from "../hooks/useLive"
import { LoadingState } from "./LoadingState"

export const labels = {
  OPENING_BOX: "Opening Box",
  OPENING_SPACE: "Opening Space",
  WAITING_FOR_SIGNAL: "Waiting for Stream",
  WAITING_FOR_UNLOCK: "Unlocking Stream",
  CONNECTING_TO_STREAM: "Connecting to Stream",
}

export const Broadcaster = ({ address }) => {
  const [locks, setLocks] = useState([])
  const { goLive, state, viewersCount, playing } = useBroadcast(address, locks)

  const onLockChange = (selected) => {
    setLocks((selected || []).map((option) => option.value))
  }

  return (
    <form className="container">
      <h1>Broadcaster</h1>
      <p>
        {state} - {viewersCount} viewers!
      </p>
      <LockPicker
        identity={address}
        onLockChange={onLockChange}
        currentLocks={locks}
      >
        <p>No lock?</p>
      </LockPicker>
      <VideoContainer>
        <Video autoplay="true" onClick={goLive} />
        <PlayButton type="button" onClick={goLive} hide={playing}>
          Go live ‣
        </PlayButton>
      </VideoContainer>
    </form>
  )
}

const VideoContainer = styled.div`
  position: relative;
  display: grid;
  justify-items: center;
  align-items: center;
`
const PlayButton = styled(Button)`
  display: ${(props) => (props.hide ? "none" : "block")};
  position: absolute;
  width: 130px;
`

export const Viewer = ({ address, identity }) => {
  const { state } = useLive(address, identity)
  return (
    <form className="container">
      <h1>Viewer</h1>
      <LoadingState loadingState={state} labels={labels} />
      <Video controls autoplay="true" />
    </form>
  )
}

/**
 * Will show a live page
 * @param {*} param0
 */
export const Live = ({ address }) => {
  const identity = useContext(IdentityContext)

  if (!identity) {
    return <>Please authenticate first</>
  }

  if (identity.toLowerCase() === address.toLowerCase()) {
    return <Broadcaster address={address} />
  }
  return <Viewer address={address} identity={identity} />
}

Live.propTypes = {
  address: PropTypes.string.isRequired,
}

export default Live

const Video = styled.video`
  width: 100%;
  border: 1px solid hsl(0, 0%, 80%);
  border-radius: 4px;
`
