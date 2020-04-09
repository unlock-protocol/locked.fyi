import PropTypes from "prop-types"
import styled from "styled-components"
import React, { useState } from "react"
import ReactMde from "react-mde"
import * as Showdown from "showdown"
import "react-mde/lib/styles/css/react-mde-all.css"
import { Link, useHistory } from "react-router-dom"
import { useQuery } from "@apollo/react-hooks"
import Select from "react-select"
import { Loading } from "./Loading"
import { Button } from "./Layout"
import { useOwnerThread } from "../hooks/useOwnerThread"
import locksByOwner from "../queries/locksByOwner"
import { notePath, writePath } from "../utils/paths"
import { showdownOptions } from "../utils/showdown"

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
  } = useOwnerThread(identity, threadId, noteId)
  const history = useHistory()
  const { data: locksData, loading: locksLoading } = useQuery(locksByOwner(), {
    variables: {
      owner: identity,
    },
  })
  const [selectedTab, setSelectedTab] = useState("write")
  const [saving, setSaving] = useState(false)

  if (loading) {
    return <Loading />
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

  const locks = locksData && locksData.locks

  const lockOptions = locks.map((lock) => ({
    value: lock.address,
    label: lock.name || lock.addresss,
  }))

  const onLockChange = (selected) => {
    setNoteAttribute(
      "locks",
      (selected || []).map((option) => option.value)
    )
  }

  const selectedLocks = note.attributes.locks
    ? lockOptions.filter(
        (lock) => note.attributes.locks.indexOf(lock.value) > -1
      )
    : []

  return (
    <form className="container" onSubmit={onSave}>
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
      <label htmlFor="locks">Locks: </label>
      <LockSelect
        inputId="locks"
        isMulti
        isLoading={locksLoading}
        value={selectedLocks}
        onChange={onLockChange}
        options={lockOptions}
      />
      {/* Source: https://github.com/andrerpena/react-mde */}
      <ReactMde
        value={note.body}
        onChange={setNoteBody}
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
        generateMarkdownPreview={(markdown) =>
          Promise.resolve(converter.makeHtml(markdown))
        }
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

const Actions = styled.div`
  margin-top: 10px;
  display: grid;
  grid-template-columns: repeat(2, 100px);
  grid-gap: 10px;
`

const LockSelect = styled(Select)`
  margin-bottom: 10px;
`
