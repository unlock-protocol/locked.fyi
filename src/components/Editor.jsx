/* eslint-disable react/jsx-props-no-spreading */
import PropTypes from "prop-types"
import styled from "styled-components"
import React, { useState } from "react"
import ReactMde from "react-mde"
import * as Showdown from "showdown"
import "react-mde/lib/styles/css/react-mde-all.css"
import { Link, useHistory } from "react-router-dom"
import { useDropzone } from "react-dropzone"
import { Loading } from "./Loading"
import { Button } from "./Layout"
import { useOwnerThread } from "../hooks/useOwnerThread"
import { notePath, writePath } from "../utils/paths"
import { showdownOptions } from "../utils/showdown"
import LockPicker from "./LockPicker"

const converter = new Showdown.Converter(showdownOptions())

const Editor = ({ identity, thread: threadId, note: noteId }) => {
  const {
    setNoteAttribute,
    setNoteBody,
    note,
    noteThread,
    loading,
    save,
    destroy,
    uploadFile,
  } = useOwnerThread(identity, threadId, noteId)
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
    return (
      <section>
        <p>
          Locked.fyi is a new kind of platform, which only uses decentralized
          storage for your notes.
        </p>
        <p>
          The first time you use it, your web browser <i>might</i> ask you to
          sign up to 3 message to <strong>Create a new 3Box profile</strong>,
          authenticate you and access your <strong>locked-fyi/notes</strong>{" "}
          space.
        </p>
        <p>Next time, it should load a little faster...</p>
        <Loading />
      </section>
    )
  }

  const onSave = (event) => {
    event.preventDefault()
    setSaving(true)
    save(note, () => {
      setSaving(false)
    })
    return false
  }

  const onDestroy = () => {
    setSaving(true)
    destroy(() => {
      setSaving(false)
      history.push(writePath())
    })
    return false
  }

  const onLockChange = (selected) => {
    setNoteAttribute(
      "locks",
      (selected || []).map((option) => option.value)
    )
  }

  return (
    <form className="container" onSubmit={onSave}>
      <LockPicker
        identity={identity}
        onLockChange={onLockChange}
        currentLocks={note.attributes.locks}
      >
        <p>
          Your note will use the <a href="/#community-lock">community lock</a>
          ... but you can also{" "}
          <a href="https://app.unlock-protocol.com/dashboard">
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
            <Link to={notePath(identity, noteThread, note.attributes.id)}>
              {note.attributes.title}
            </Link>
          </>
        )}
      </div>
    </form>
  )
}

Editor.propTypes = {
  identity: PropTypes.string.isRequired,
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
  grid-template-columns: repeat(2, 100px);
  grid-gap: 10px;
`
