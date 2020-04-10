import PropTypes from "prop-types"
import React from "react"
import { Link } from "react-router-dom"
import { useAddress } from "../hooks/useAddress"
import { Loading } from "./Loading"
import { notePath } from "../utils/paths"

export const Thread = ({ thread, address, loading }) => {
  if (!loading && !thread.length) {
    return (
      <section>
        <p>No notes have been published for this lock yet!</p>
      </section>
    )
  }
  return (
    <section>
      <ul>
        {thread.map((entry) => {
          return (
            <li key={entry.postId}>
              <Link
                to={notePath(address, entry.thread, entry.note.attributes.id)}
              >
                {entry.note.attributes.title || "_ "}
              </Link>
            </li>
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
