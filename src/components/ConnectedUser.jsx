import PropTypes from "prop-types"
import styled from "styled-components"
import React from "react"
import { Link } from "react-router-dom"

import { useProfile } from "../hooks/useProfile"
import { threadPath } from "../utils/paths"

const emoji = ["👊", "👌", "🙌", "👋", "👍", "🖖"]

export const ConnectedUser = ({ address }) => {
  const { loading, profile } = useProfile(address)
  if (loading) {
    return <Identity>&nbsp;</Identity>
  }

  const handEmoji = new Date().getHours() % emoji.length

  const name = profile.name || address

  return (
    <Identity title={name}>
      <Emoji role="img" aria-label="hi!">
        {emoji[handEmoji]}
      </Emoji>
      <Link to={threadPath(address)}>
        {name.split(/[ ,]+/)[0].substring(0, 7)}
      </Link>
    </Identity>
  )
}

ConnectedUser.propTypes = {
  address: PropTypes.string.isRequired,
}

export default ConnectedUser

const Identity = styled.abbr`
  border-bottom: none !important;
  cursor: inherit !important;
  text-decoration: none !important;
  display: flex;
  align-items: center;
  align-content: center;
`

const Emoji = styled.span`
  display: inline-block;
  font-size: 0.8em;
  margin-right: 3px;
`
