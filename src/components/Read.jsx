import React from 'react';
import { useAddress } from '../hooks/useAddress'
import FrontMatter from 'front-matter'
import {Link} from "react-router-dom";
import {Loading} from './Loading'

export const Thread = ({thread, address}) => {

  return <section>
    <p>Read notes for {address}</p>
    {!thread.length && <p>No notes have been published for this lock yet!</p>}
    <ul>
      {thread.map((entry, index) => {
        const note = FrontMatter(entry.message)
        const notePath = `/?address=${address}&note=${index}`
        return (<li key={entry.postId}>
          <Link to={notePath}>{note.attributes.title}</Link>
        </li>)
      })}
    </ul>
  </section>
}

/**
 * Will show all of the notes
 * TODO add pagination
 * @param {*} param0
 */
export const Read = ({address}) => {
  const {thread, loading} = useAddress(address)
  if(loading) {
    return <Loading />
  }

  return <Thread thread={thread} address={address} />
}
export default Read