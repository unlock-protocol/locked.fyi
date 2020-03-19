import React, {useContext} from 'react';
import Editor from './Editor'

import {IdentityContext} from '../components/Layout'

const Write = ({note}) => {
  const identity = useContext(IdentityContext)
  if(!identity) {
    return <>Please authenticate first</>
  }
  return <Editor identity={identity} note={note} />
}
export default Write