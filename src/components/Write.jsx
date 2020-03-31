import React, {useContext} from 'react';
import Editor from './Editor'
import { ApolloProvider } from '@apollo/react-hooks';
import ApolloClient from 'apollo-boost'

import {IdentityContext} from '../components/Layout'

const client = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/unlock-protocol/unlock',
})

const Write = ({note}) => {
  const identity = useContext(IdentityContext)
  if(!identity) {
    return <>Please authenticate first</>
  }

  return   <ApolloProvider client={client}>
    <Editor identity={identity} note={note} />
    </ApolloProvider>
}
export default Write