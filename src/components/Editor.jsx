import React from 'react';
import ReactMde from "react-mde";
import * as Showdown from "showdown";
import "react-mde/lib/styles/css/react-mde-all.css";
import {Link} from "react-router-dom";

const converter = new Showdown.Converter({
  tables: true,
  simplifiedAutoLink: true,
  strikethrough: true,
  tasklists: true
});

const Editor = ({lock, thread, save, saved, error, saving}) => {
  const [body, setBody] = React.useState("# Hello world!");
  const [title, setTitle] = React.useState("Untitled");
  const [author, setAuthor] = React.useState("Unnamed");
  const [selectedTab, setSelectedTab] = React.useState("write");

  const onSave = (event) => {
    event.preventDefault()
    save({
      attributes: {
        title,
        author
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