import React, { useContext } from "react"
import PropTypes from "prop-types"
import { ApolloProvider } from "@apollo/react-hooks"
import ApolloClient from "apollo-boost"
import Editor from "./Editor"

import { IdentityContext } from "./Layout"

const client = new ApolloClient({
  uri: "https://api.thegraph.com/subgraphs/name/unlock-protocol/unlock",
})

const Write = ({ note, thread }) => {
  const identity = useContext(IdentityContext)
  if (!identity) {
    return <>Please authenticate first</>
  }

  return (
    <ApolloProvider client={client}>
      <Editor identity={identity} note={note} thread={thread} />
    </ApolloProvider>
  )
}

Write.propTypes = {
  note: PropTypes.string,
  thread: PropTypes.string,
}

Write.defaultProps = {
  note: null,
  thread: null,
}

export default Write
