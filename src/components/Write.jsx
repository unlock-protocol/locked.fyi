import React, { useContext } from "react"
import PropTypes from "prop-types"
import Editor from "./Editor"

import { IdentityContext } from "./Layout"

const Write = ({ note, thread }) => {
  const identity = useContext(IdentityContext)
  if (!identity) {
    return <>Please authenticate first</>
  }

  return <Editor identity={identity} note={note} thread={thread} />
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
