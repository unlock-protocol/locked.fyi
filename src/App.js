import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useLocation
} from "react-router-dom";
import Write from './components/Write'
import Read from './components/Read'
import Home from './components/Home'


function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const Routes = () => {
  let query = useQuery();
  const lock = query.get("lock");

  return (<Switch>
    <Route path="/write">
      <Write lock={lock} />
    </Route>
    <Route path="/">
      {lock && <Read lock={lock} />}
      {!lock && <Home />}
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
