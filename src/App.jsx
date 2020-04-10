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

const ReadMatch = ({ match }) => (
  <Read address={match.params.address} thread={match.params.thread} />
)

ReadMatch.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      address: PropTypes.string,
      thread: PropTypes.string,
    }).isRequired,
  }).isRequired,
}

const NoteMatch = ({ match }) => (
  <Note
    note={match.params.note}
    thread={match.params.thread}
    address={match.params.address}
  />
)

NoteMatch.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      address: PropTypes.string,
      thread: PropTypes.string,
      note: PropTypes.string,
    }).isRequired,
  }).isRequired,
}

const Routes = () => {
  const query = useQuery()
  const note = query.get("note")
  const thread = query.get("thread")

  return (
    <Layout>
      <Switch>
        <Route path="/notes/write">
          <Write note={note} thread={thread} />
        </Route>
        <Route
          path="/notes/:address(0x[a-fA-F0-9]{40})/:thread([0-9]+)/:note([0-9]+)"
          component={NoteMatch}
        />
        <Route
          path="/notes/:address(0x[a-fA-F0-9]{40})/:thread([0-9])?"
          component={ReadMatch}
        />

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
