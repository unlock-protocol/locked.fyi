import PropTypes from "prop-types"
import React from "react"
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useLocation,
} from "react-router-dom"
import Write from "./components/Write"
import { Read } from "./components/Read"
import { Note } from "./components/Note"
import { Home } from "./components/Home"
import { Layout } from "./components/Layout"

function useQuery() {
  return new URLSearchParams(useLocation().search)
}

const ReadMatch = ({ match }) => <Read address={match.params.address} />

ReadMatch.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      address: PropTypes.string,
    }).isRequired,
  }).isRequired,
}

const NoteMatch = ({ match }) => (
  <Note note={match.params.note} address={match.params.address} />
)

NoteMatch.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      address: PropTypes.string,
      note: PropTypes.string,
    }).isRequired,
  }).isRequired,
}

const Routes = () => {
  const query = useQuery()
  const note = query.get("note")

  return (
    <Layout>
      <Switch>
        <Route path="/write">
          <Write note={note} />
        </Route>
        <Route
          path="/:address(0x[a-fA-F0-9]{40})/:note([0-9]+)"
          component={NoteMatch}
        />
        <Route path="/:address(0x[a-fA-F0-9]{40})" component={ReadMatch} />

        <Route path="/">
          <Home />
        </Route>
      </Switch>
    </Layout>
  )
}

function App() {
  return (
    <Router>
      <Routes />
    </Router>
  )
}

export default App
