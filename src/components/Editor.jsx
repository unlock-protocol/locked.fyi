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


const Editor = ({identity}) => {
  const {thread, loading, save, saved, error, saving} = useOwnerThread(identity)

  const [body, setBody] = useState("# Hello world!");
  const [title, setTitle] = useState("Untitled");
  const [locks, setLocks] = useState("");
  const [author, setAuthor] = useState("Unnamed");
  const [selectedTab, setSelectedTab] = useState("write");

  if (loading || !thread) {
    return <Loading />
  }

  const onSave = (event) => {
    event.preventDefault()
    save({
      attributes: {
        title,
        author,
        locks: locks.split(/[\W]+/).filter(x => !!x).map(x => `"${x}"`)
      },
      body
    })
    return false
  }

  const threadPath = `/?thread=${thread.address}`

  return (
    <form className="container" onSubmit={onSave}>
      <p>Write new note for <Link to={threadPath}>{threadPath}</Link></p>
      <label htmlFor="title">Title </label>
      <input type="text" id="title" name="title" value={title} onChange={(event) => {
        setTitle(event.target.value)
      }} />
      <label htmlFor="author">Author </label>
      <input type="text" id="author" name="author" value={author} onChange={(event) => {
        setAuthor(event.target.value)
      }} />
      <label htmlFor="locks">Locks (coma-separated)</label>
      <input type="text" id="locks" name="locks" value={locks} onChange={(event) => {
        setLocks(event.target.value)
      }} />

      {/* Source: https://github.com/andrerpena/react-mde */}
      <ReactMde
        value={body}
        onChange={setBody}
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
        generateMarkdownPreview={markdown =>
          Promise.resolve(converter.makeHtml(markdown))
        }
      />
      {!saving && !saved &&
      <button type="submit">Save</button>}
      {saving && <span>Saving</span>}
      {saved && <span>{saved}</span>}
    </form>
  );
}
export default Editor