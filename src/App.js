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


function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const Routes = () => {
  let query = useQuery();
  const thread = query.get("thread");
  const note = query.get("note");

  return (<Switch>
    <Route path="/write">
      <Write />
    </Route>
    <Route path="/">
      {thread && note && <Note note={note} thread={thread} />}
      {thread && !note && <Read thread={thread} />}
      {!thread && <Home />}
    </Route>
  </Switch>)
}


function App() {
  return (
    <Router>
      <Routes />
    </Router>
  );
}

export default App;
