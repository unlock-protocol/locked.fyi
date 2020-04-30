import React from "react"
import PropTypes from "prop-types"
import { useWeb3React } from "@web3-react/core"
import Editor from "./Editor"

const Write = ({ note, thread }) => {
  const { account } = useWeb3React()
  if (!account) {
    return <>Please authenticate first</>
  }

  return <Editor identity={account} note={note} thread={thread} />
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
