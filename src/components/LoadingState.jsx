import PropTypes from "prop-types"
import styled from "styled-components"
import React from "react"
import { Loading } from "./Loading"

const labels = {
  OPENING_BOX: "Opening profile",
  OPENING_SPACE: "Opening space",
  OPENING_THREAD: "Opening thread",
}

export const LoadingState = ({ loadingState }) => {
  const states = ["OPENING_BOX", "OPENING_SPACE", "OPENING_THREAD"]

  let afterLoadingState = false

  return (
    <section>
      <ProgressBar>
        {states.map((state) => {
          afterLoadingState = afterLoadingState || state === loadingState
          return (
            <Step
              key={state}
              active={!afterLoadingState || state === loadingState}
            >
              {labels[state]}
            </Step>
          )
        })}
      </ProgressBar>
      <p>
        Locked.fyi is a new kind of platform, which only uses decentralized
        storage for your notes. It takes a few seconds to load!
      </p>
      <Loading />
    </section>
  )
}

LoadingState.propTypes = {
  loadingState: PropTypes.string,
}

LoadingState.defaultProps = {
  loadingState: null,
}

const ProgressBar = styled.ul`
  padding: 0px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(20px, 1fr));
`

const Step = styled.li`
  color: ${(props) => (props.active ? "#ff6771" : "#cccccc")};
  display: inline;
  border-top: 3px solid ${(props) => (props.active ? "#ff6771" : "#cccccc")};
`

export default LoadingState
