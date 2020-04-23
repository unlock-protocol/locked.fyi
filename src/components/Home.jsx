import React from "react"
import { Link, useLocation } from "react-router-dom"
import { threadPath } from "../utils/paths"
import { Loading } from "./Loading"

const HomeContent = () => (
  <section>
    <p>
      <a href="/">Locked.fyi</a> is a <em>decentralized blogging platform</em>!
      The content is stored on <a href="https://ipfs.io/">IPFS</a>, through the
      use of <a href="https://3box.io/">3Box</a>.
    </p>
    <p>
      Because we think the web needs a <em>better business model</em>, one that
      does not steal your attention and respects your privacy, we ask that you
      purchase a membership to read its content. Don&apos;t worry though,
      we&apos;re currently charging less than $1 per year. Also,{" "}
      <a href="https://github.com/unlock-protocol/locked.fyi">
        all of this open source
      </a>
      .
    </p>
    <p>
      However, if you&apos;re writing your own stories, you can also set your
      own membership(s), including price, duration and more! Deploy your own
      lock using the <a href="https://unlock-protocol.com/">Unlock Protocol</a>!
    </p>
    <p>We'd love to count you as one of our members!</p>
    <p>
      --{" "}
      <Link to={threadPath("0xdd8e2548da5a992a63ae5520c6bc92c37a2bcc44")}>
        Julien
      </Link>
    </p>
  </section>
)

/**
 * Shows loading unless we are on the home page (avoids a flash when accessing deep pages directly)
 */
export const Home = () => {
  const { pathname } = useLocation()
  if (pathname === "/") {
    return <HomeContent />
  }
  return <Loading />
}
export default Home
