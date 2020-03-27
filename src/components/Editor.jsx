import styled from "styled-components"
import React, {useState} from 'react';
import ReactMde from "react-mde";
import * as Showdown from "showdown";
import "react-mde/lib/styles/css/react-mde-all.css";
import {Link} from "react-router-dom";
import {Loading} from './Loading'
import {Button } from './Layout'
import {useOwnerThread} from '../hooks/useOwnerThread'

const converter = new Showdown.Converter({
  tables: true,
  simplifiedAutoLink: true,
  strikethrough: true,
  tasklists: true
});


const Editor = ({identity, note: index}) => {
  const {thread, note, setNoteAttribute, setNoteBody, loading, save, destroy, saving, postId} = useOwnerThread(identity, index)

  const [selectedTab, setSelectedTab] = useState("write");

  if (loading || !thread) {
    return <Loading />
  }

  const onSave = (event) => {
    event.preventDefault()
    save()
    return false
  }

  const notePath = `/${identity}/${note.attributes.id}`

  return (
    <form className="container" onSubmit={onSave}>
      <label htmlFor="locks">Locks (coma-separated)</label>
      <input type="text" id="locks" name="locks" value={note.attributes?.locks} onChange={(event) => {
        setNoteAttribute('locks', event.target.value.split(/[\W]+/).filter(x => !!x))
      }} />

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