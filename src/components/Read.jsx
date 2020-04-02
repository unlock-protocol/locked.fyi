import PropTypes from "prop-types"
import React from "react"
import { Link } from "react-router-dom"
import { useAddress } from "../hooks/useAddress"
import { Loading } from "./Loading"

export const Thread = ({ thread, address }) => (
  <section>
    {!thread.length && <p>No notes have been published for this lock yet!</p>}
    <ul>
      {thread.map((entry) => {
        const notePath = `/${address}/${entry.note.attributes.id}`
        return (
          <li key={entry.postId}>
            <Link to={notePath}>{entry.note.attributes.title}</Link>
          </li>
        )
      })}
    </ul>
  </section>
)

Thread.propTypes = {
  thread: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  address: PropTypes.string.isRequired,
}

/**
 * Will show all of the notes
 * TODO add pagination
 * @param {*} param0
 */
export const Read = ({ address }) => {
  const { thread, loading } = useAddress(address)
  if (loading) {
    return <Loading />
  }
  return <Thread thread={thread} address={address} />
}

Read.propTypes = {
  address: PropTypes.string.isRequired,
}

export default Read
