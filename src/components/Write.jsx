import React,  {useContext} from 'react';
import Editor from './Editor'

import {IdentityContext} from '../components/Layout'

const Write = () => {
  const identity = useContext(IdentityContext)
  if(!identity) {
    return <>Please authenticate first</>
  }
  return <Editor identity={identity} />
}
export default Write