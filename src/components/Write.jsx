import React, { useContext } from "react"
import PropTypes from "prop-types"
import Editor from "./Editor"
import BoxContext from "../contexts/boxContext"

const Write = ({ note, thread }) => {
  const { box } = useContext(BoxContext)
  if (!box) {
    return <>Please authenticate first</>
  }

  return <Editor note={note} thread={thread} />
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
