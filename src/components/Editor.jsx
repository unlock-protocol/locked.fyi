import React, {useState} from 'react';
import ReactMde from "react-mde";
import * as Showdown from "showdown";
import "react-mde/lib/styles/css/react-mde-all.css";
import {Link} from "react-router-dom";
import {Loading} from './Loading'

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

  const threadPath = `/${identity}`

  return (
    <form className="container" onSubmit={onSave}>
      <p>Feed <Link to={threadPath}>{threadPath}</Link></p>
      <label htmlFor="title">Title </label>
      <input type="text" id="title" name="title" value={note.attributes?.title} onChange={(event) => {
        setNoteAttribute('title', event.target.value)
      }} />
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
      {!saving &&
      <button type="submit">Save</button>}
      {saving && <span>Saving</span>}
      {postId && <button type="button" onClick={destroy}>Destroy</button>}
    </form>
  );
}
export default Editor