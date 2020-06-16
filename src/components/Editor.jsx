/* eslint-disable react/jsx-props-no-spreading */
import PropTypes from "prop-types"
import styled from "styled-components"
import React, { useState } from "react"
import ReactMde from "react-mde"
import * as Showdown from "showdown"
import "react-mde/lib/styles/css/react-mde-all.css"
import { Link, useHistory } from "react-router-dom"
import { useDropzone } from "react-dropzone"
import { useWeb3React } from "@web3-react/core"
import { Loading } from "./Loading"
import { Button } from "./Button"
import { useOwnerThread } from "../hooks/useOwnerThread"
import { notePath, writePath } from "../utils/paths"
import { showdownOptions } from "../utils/showdown"
import LockPicker from "./LockPicker"
import Checkbox from "./Checkbox"

const converter = new Showdown.Converter(showdownOptions())

const Editor = ({ thread: threadId, note: noteId }) => {
  const { account } = useWeb3React()

  const {
    setNoteAttribute,
    setNoteBody,
    note,
    noteThread,
    loading,
    save,
    destroy,
    uploadFile,
  } = useOwnerThread(account, threadId, noteId)

  const onDrop = async (acceptedFiles) => {
    const { body } = note // keeping track of body, as-is

    // TODO: support multiple file uploads at once!
    const file = acceptedFiles[0]
    const textArea = document.querySelector(".mde-text")
    const insertAt = textArea.selectionStart
    const uploadPlaceholder = "\nUploading file..."

    setNoteBody(
      body.slice(0, insertAt) + uploadPlaceholder + body.slice(insertAt)
    )

    const url = await uploadFile(file)

    // We should look at the mimetype for files an respond accordingly
    // If it is an image, embed as is
    // if it is an mp3 use an audio player
    // if it is an mp4, use a video player...
    let markdown = `\n${url}\n`
    if (file.type.match("image/*")) {
      markdown = `![](${url})`
    } else {
      // Link to the file
      markdown = `\n[${file.name}](${url})\n`
    }

    setNoteBody(`${body.slice(0, insertAt)}${markdown}${body.slice(insertAt)}`)
    // WARNING: what happens if the body was changed?

    // Restore the position
    textArea.setSelectionRange(
      insertAt + markdown.length + 1,
      insertAt + markdown.length + 1
    )
  }
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
  })

  const history = useHistory()
  const [selectedTab, setSelectedTab] = useState("write")
  const [saving, setSaving] = useState(false)

  if (loading) {
    return <Loading />
  }

  const onSave = async (event) => {
    event.preventDefault()
    setSaving(true)
    await save()
    setSaving(false)
    return false
  }

  const onDestroy = async () => {
    setSaving(true)
    await destroy()
    setSaving(false)
    history.push(writePath())
    return false
  }

  const onLockChange = (selected) => {
    setNoteAttribute(
      "locks",
      (selected || []).map((option) => option.value)
    )
  }

  const draftToggle = () => {
    setNoteAttribute("draft", !note.attributes.draft)
  }

  const isDraft = note.attributes.draft
  return (
    <form className="container" onSubmit={onSave}>
      <LockPicker
        identity={account}
        onLockChange={onLockChange}
        currentLocks={note.attributes.locks}
      >
        <p>
          Your note will use the{" "}
          <a target="_blank" rel="noopener noreferrer" href="/#community-lock">
            community lock
          </a>
          ... but you can also{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://app.unlock-protocol.com/dashboard"
          >
            deploy your own lock
          </a>{" "}
          if you want to monetize your own notes.
        </p>
      </LockPicker>
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        {/* Source: https://github.com/andrerpena/react-mde */}
        <MarkDownEditor
          isDragActive={isDragActive}
          value={note.body}
          onChange={setNoteBody}
          selectedTab={selectedTab}
          onTabChange={setSelectedTab}
          generateMarkdownPreview={(markdown) =>
            Promise.resolve(converter.makeHtml(markdown))
          }
        />
      </div>
      <Checkbox
        name="draft"
        checked={isDraft}
        onChange={draftToggle}
        label="Draft"
      />
      <Actions>
        <nav>
          <Button type="submit" disabled={saving}>
            Save
          </Button>
        </nav>
        <nav>
          <Button type="button" disabled={saving} onClick={onDestroy}>
            Destroy
          </Button>
        </nav>
        {saving && <Loading />}
      </Actions>
      <div>
        {note.attributes.id && note.attributes.id > 0 && (
          <>
            ➡{" "}
            <Link to={notePath(account, noteThread, note.attributes.id)}>
              {note.attributes.title}
            </Link>
          </>
        )}
      </div>
    </form>
  )
}

Editor.propTypes = {
  thread: PropTypes.string,
  note: PropTypes.string,
}

Editor.defaultProps = {
  thread: null,
  note: null,
}

export default Editor

const MarkDownEditor = styled(ReactMde)`
  border: ${(props) =>
    props.isDragActive ? "1px solid #ff6771" : "1px solid #c8ccd0"};
`

const Actions = styled.div`
  margin-top: 10px;
  display: grid;
  grid-template-columns: repeat(3, 100px);
  grid-gap: 10px;
`
