import React from 'react';
import {useOwnerThread} from '../hooks/useOwnerThread'
import Editor from './Editor'

const Write = ({lock}) => {
  const {thread, loading, save, saved, error, saving} = useOwnerThread()
  if (loading) {
    return <p>Loading!</p>
  }
  return <Editor thread={thread} lock={lock} save={save} saved={saved} error={error} saving={saving} />
}
export default Write