import React, { useContext } from "react"
import PropTypes from "prop-types"
import { Markdown } from "react-showdown"
import { Link } from "react-router-dom"
import styled from "styled-components"
import { useNote } from "../hooks/useNote"
import { useAddress } from "../hooks/useAddress"
import { useLocks } from "../hooks/useLocks"
import { useProfile } from "../hooks/useProfile"
import { Loading } from "./Loading"
import { IdentityContext, Button } from "./Layout"
import { threadPath, writePath } from "../utils/paths"

const defaultLock = "0xaad5Bff48e1534EF1f2f0A4184F5C2E61aC47EC3"

/**
 * Shows the child
 * @param {*} param0
 */
export const Locked = ({ locks, children }) => {
  const { locked, loading, unlock } = useLocks(locks)
  if (loading) {
    return <Loading />
  }
  if (locked) {
    return (
      <CallToAction>
        This note, like all notes on locked.fyi is locked. It&apos;s not (just)
        about the money, it&apos;s about{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://unlock-protocol.com/blog/its-time-to-unlock-the-web/"
        >
          using a better business model for the web
        </a>
        , one which does not rely on stealing attention or abusing your privacy.
        <UnlockButton onClick={unlock}>Unlock</UnlockButton>
      </CallToAction>
    )
  }
  return children
}

export const Author = ({ address }) => {
  const { loading, profile } = useProfile(address)
  if (loading) {
    return <span>&nbsp;</span>
  }
  if (profile.website) {
    return (
      <span>
        By
        <a target="_blank" rel="noopener noreferrer" href={profile.website}>
          {profile.name}
        </a>
      </span>
    )
  }
  if (profile.name) {
    return (
      <span>
        By
        {profile.name}
      </span>
    )
  }
  return (
    <span>
      By{" "}
      <abbr title={address}>
        {address.substring(0, 15)}
        ...
      </abbr>
    </span>
  )
}

Author.propTypes = {
  address: PropTypes.string.isRequired,
}

/**
 * Note component
 * @param {*} param0
 */
export const Note = ({ address, note: index }) => {
  const { thread } = useAddress(address)
  const identity = useContext(IdentityContext)

  const { note, error, loading } = useNote(thread, index)

  if (error) {
    return <p>{error}</p>
  }
  if (loading) {
    return <Loading />
  }

  const viewedByAuthor = identity === note.attributes.author

  const locks =
    note.attributes.locks && note.attributes.locks.length
      ? note.attributes.locks
      : [defaultLock]

  return (
    <article>
      <Author address={note.attributes.author} />
      <Locked locks={locks}>
        <Markdown markup={note.body} />
      </Locked>
      <footer>
        <nav>
          Back to <Link to={threadPath(address)}>Thread</Link>
        </nav>
        {viewedByAuthor && (
          <nav>
            <Link to={writePath(index)}>Edit</Link>
          </nav>
        )}
      </footer>
    </article>
  )
}

Note.propTypes = {
  address: PropTypes.string.isRequired,
  note: PropTypes.string.isRequired,
}

export default Note

const CallToAction = styled.p`
  font-family: "Bellota Text", cursive;
  text-align: center;
  align-items: center;
  margin: 30px 10px;
  color: grey;
  justify-items: center;
`

const UnlockButton = styled(Button)`
  margin-top: 20px;
  margin-left: auto;
  margin-right: auto;
`
