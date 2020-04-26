import PropTypes from "prop-types"
import React, { useContext } from "react"
import { Link } from "react-router-dom"
import { useAddress } from "../hooks/useAddress"
import { Loading } from "./Loading"
import { notePath } from "../utils/paths"
import { IdentityContext } from "./Layout"

const Item = ({ entry, address, viewerIsAuthor }) => {
  if (viewerIsAuthor) {
    return (
      <li key={entry.postId}>
        {entry.note.attributes.draft ? "Draft " : ""}
        <Link to={notePath(address, entry.thread, entry.note.attributes.id)}>
          {entry.note.attributes.title || "_ "}
        </Link>
      </li>
    )
  }
  if (!entry.note.attributes.draft) {
    return (
      <li key={entry.postId}>
        <Link to={notePath(address, entry.thread, entry.note.attributes.id)}>
          {entry.note.attributes.title || "_ "}
        </Link>
      </li>
    )
  }
  // Draft are not shown!
  return null
}

Item.propTypes = {
  entry: PropTypes.shape({
    postId: PropTypes.string.isRequired,
  }).isRequired,
  address: PropTypes.string.isRequired,
  viewerIsAuthor: PropTypes.bool.isRequired,
}

export const Thread = ({ thread, address, loading }) => {
  const identity = useContext(IdentityContext)

  if (!loading && !thread.length) {
    if (identity !== address) {
      return (
        <section>
          <p>No notes have been published for this lock yet!</p>
        </section>
      )
    }
    return (
      <section>
        <p>You have not published any note yet!</p>
      </section>
    )
  }

  return (
    <section>
      <ul>
        {thread.map((entry) => {
          return (
            <Item
              entry={entry}
              address={address}
              viewerIsAuthor={identity === address}
            />
          )
        })}
      </ul>
      {loading && <Loading />}
    </section>
  )
}

Thread.propTypes = {
  thread: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  address: PropTypes.string.isRequired,
  loading: PropTypes.bool,
}

Thread.defaultProps = {
  loading: true,
}

/**
 * Will show all of the notes
 * @param {*} param0
 */
export const Read = ({ address }) => {
  const { thread, loading } = useAddress(address)
  return <Thread thread={thread} address={address} loading={loading} />
}

Read.propTypes = {
  address: PropTypes.string.isRequired,
}

export default Read
