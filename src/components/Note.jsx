import React from 'react';
import { useThread } from '../hooks/useThread'
import { Markdown } from 'react-showdown'
import FrontMatter from 'front-matter'
import {Link} from "react-router-dom";

/**
 * Note component
 * @param {*} param0
 */
export const Note = ({thread: threadAddress, note: index}) => {
  const {thread, error, loading} = useThread(threadAddress)

  if(error) {
    return <p>{error}</p>
  }
  if(loading) {
    return <p>Loading...</p>
  }

  const item = thread[index]
  const note = FrontMatter(item.message)

  const threadPath = `/?thread=${threadAddress}`
  return <article>
    <Markdown markup={note.body}></Markdown>
  <footer>
    Back to <Link to={threadPath}>Thread</Link>
  </footer>
  </article>
}

export default Note