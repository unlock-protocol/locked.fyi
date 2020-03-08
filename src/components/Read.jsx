import React from 'react';
import { useThread } from '../hooks/useThread'
import FrontMatter from 'front-matter'
import {Link} from "react-router-dom";

/**
 * Will show all of the notes
 * TODO add pagination
 * @param {*} param0
 */
export const Read = ({thread: threadAddress}) => {
  const {thread, error, loading} = useThread(threadAddress)
  if(error) {
    return <p>{error}</p>
  }
  if(loading) {
    return <p>Loading...</p>
  }

  return <section>
    <p>Read notes for {threadAddress}</p>
    {!thread.length && <p>No notes have been published for this lock yet!</p>}
    <ul>
      {thread.map((entry, index) => {
        const note = FrontMatter(entry.message)
        const notePath = `/?thread=${threadAddress}&note=${index}`
        return (<li key={entry.postId}>
          <Link to={notePath}>{note.attributes.title}</Link>
        </li>)
      })}
    </ul>
  </section>
}
export default Read