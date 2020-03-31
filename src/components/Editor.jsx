import styled from "styled-components"
import React, {useState} from 'react';
import ReactMde from "react-mde";
import * as Showdown from "showdown";
import "react-mde/lib/styles/css/react-mde-all.css";
import {Link} from "react-router-dom";
import {Loading} from './Loading'
import {Button } from './Layout'
import {useOwnerThread} from '../hooks/useOwnerThread'
import { useQuery } from '@apollo/react-hooks';
import locksByOwner from '../queries/locksByOwner'
import Select from 'react-select'

const converter = new Showdown.Converter({
  tables: true,
  simplifiedAutoLink: true,
  strikethrough: true,
  tasklists: true
});


const Editor = ({identity, note: index}) => {
  const {thread, note, setNoteAttribute, setNoteBody, loading, save, destroy, saving, postId} = useOwnerThread(identity, index)
  const { data: locksData, loading: locksLoading } = useQuery(locksByOwner(), {
    variables: {
      owner: identity,
    },
  })
  const [selectedTab, setSelectedTab] = useState("write");

  if (loading || !thread) {
    return <Loading />
  }

  const onSave = (event) => {
    event.preventDefault()
    save()
    return false
  }

  const locks = locksData?.locks

  const notePath = `/${identity}/${note.attributes.id}`

  const lockOptions = locks.map((lock) => {
    return {
      value: lock.address,
      label: lock.name || lock.addresss
    }
  });

  const onLockChange = (selected, x) => {
    console.log(selected.map((option) => option.value))
    setNoteAttribute('locks', selected.map((option) => option.value))
  }

  const selectedLocks = lockOptions.filter((lock) => {
    return note.attributes?.locks.indexOf(lock.value) > -1
  })


  return (
    <form className="container" onSubmit={onSave}>

      <label htmlFor="locks">Locks: </label>

      <LockSelect isMulti isLoading={locksLoading} value={selectedLocks} onChange={onLockChange} options={lockOptions} />

      {/* Source: https://github.com/andrerpena/react-mde */}
      <ReactMde
        value={note.body}
        onChange={setNoteBody}
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
        generateMarkdownPreview={markdown =>
          Promise.resolve(converter.makeHtml(markdown))
        }
      />
      <Actions>
        <Button type="submit" disabled={saving} >{saving ? 'Saving' : 'Save'}</Button>
        {postId && <Button type="button" disabled={saving} onClick={destroy}>Destroy</Button>}
      </Actions>
      <div>
      ➡ <Link to={notePath}>{note.attributes.title}</Link>
      </div>
    </form>
  );
}

export default Editor

const Actions = styled.div`
  margin-top: 10px;
  display: flex;
  grid-gap: 10px;
`

const LockSelect = styled(Select)`
  margin-bottom: 10px;
`