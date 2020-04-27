import PropTypes from "prop-types"
import styled from "styled-components"
import React from "react"

export const LoadingState = ({ loadingState, labels, children }) => {
  const states = Object.keys(labels)

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
      {children}
    </section>
  )
}

LoadingState.propTypes = {
  loadingState: PropTypes.string,
  labels: PropTypes.objectOf({}).isRequired,
  children: PropTypes.element,
}

LoadingState.defaultProps = {
  loadingState: null,
  children: null,
}

const ProgressBar = styled.ul`
  padding: 0px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
`

const Step = styled.li`
  color: ${(props) => (props.active ? "#ff6771" : "#cccccc")};
  display: inline;
  border-top: 3px solid ${(props) => (props.active ? "#ff6771" : "#cccccc")};
`

export default LoadingState
