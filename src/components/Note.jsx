import React from 'react';
import { useThread } from '../hooks/useThread'
import { Markdown } from 'react-showdown'
import FrontMatter from 'front-matter'
import {Link} from "react-router-dom";
import {useLocks} from '../hooks/useLocks'
import {Loading} from './Loading'

/**
 * Shows the child
 * @param {*} param0
 */
export const Locked = ({locks, children}) => {
  const {locked, loading, unlock} = useLocks(locks)
  if(loading) {
    return <Loading />
  }
  if (locked) {
    return <p><button onClick={unlock}>Unlock</button></p>
  }
  return children
}

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
    return <Loading />
  }

  const item = thread[index]
  const note = FrontMatter(item.message)
  const threadPath = `/?thread=${threadAddress}`
  return <article>
    <Locked locks={note.attributes.locks}>
      <Markdown markup={note.body}></Markdown>
    </Locked>
  <footer>
    Back to <Link to={threadPath}>Thread</Link>
  </footer>
  </article>
}

export default Note