import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useLocation
} from "react-router-dom";
import Write from './components/Write'
import Read from './components/Read'
import Note from './components/Note'
import Home from './components/Home'
import Layout from './components/Layout'

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const Routes = () => {
  let query = useQuery();
  const thread = query.get("thread");
  const note = query.get("note");

  return (
  <Layout>
    <Switch>
      <Route path="/write">
        <Write note={note} />
      </Route>
      <Route path="/">
        {thread && note && <Note note={note} thread={thread} />}
        {thread && !note && <Read thread={thread} />}
        {!thread && <Home />}
      </Route>
    </Switch>
  </Layout>)
}


function App() {
  return (
    <Router>
      <Routes />
    </Router>
  );
}

export default App;
