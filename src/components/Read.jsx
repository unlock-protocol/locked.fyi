import React from 'react';
import { useLockMetadata } from '../hooks/useLockMetadata'
import { useIpfsNote } from '../hooks/useIpfsNote'
import { Markdown } from 'react-showdown'

/**
 * Note component
 * @param {*} param0
 */
export const Note = ({cid}) => {
  const {note, loading, error} = useIpfsNote(cid)
  if(error) {
    return <p>{error}</p>
  }

  if(loading) {
    return <p>Loading...</p>
  }
  return <article>
    <h1>{note.attributes.title}</h1>
    <span>By {note.attributes.author}</span>
    <Markdown markup={ note.body } />
  </article>
}

/**
 * Will show all of the notes
 * TODOL add pagination
 * @param {*} param0
 */
export const Read = ({lock: lockAddress}) => {
  const {lock, error, loading} = useLockMetadata(lockAddress)
  if(error) {
    return <p>{error}</p>
  }
  if(loading) {
    return <p>Loading...</p>
  }

  return <section>
    <p>Read notes for {lockAddress}</p>
    {!lock.notes && <p>No notes have been published for this lock yet!</p>}
    <ul>
      {lock.notes.map((cid) => {
        return (<li key={cid}>
          <Note cid={cid} />
        </li>)
      })}
    </ul>
  </section>
}
export default Read