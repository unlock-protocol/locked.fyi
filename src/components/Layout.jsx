import PropTypes from "prop-types"
import styled from "styled-components"
import React from "react"
import { Link } from "react-router-dom"
import { useWeb3React } from "@web3-react/core"

import { writePath } from "../utils/paths"
import { ConnectedUser } from "./ConnectedUser"
import { Authenticate } from "./Authenticate"
import { Button } from "./Button"
import { useBox } from "../hooks/useBox"
import { Loading } from "./Loading"

export const Layout = ({ children }) => {
  const { account } = useWeb3React()
  const { loading } = useBox(account)

  return (
    <Page>
      <Header>
        <h1>
          <Link to="/">Locked.fyi</Link>
        </h1>
        <nav>
          {loading && <Loading />}
          {!loading && !account && <Authenticate />}
          {!loading && account && <ConnectedUser address={account} />}
        </nav>
        <nav>
          <StyledLink to={writePath()}>
            <WriteButton>Write</WriteButton>
          </StyledLink>
        </nav>
      </Header>

      <Body>{children}</Body>
    </Page>
  )
}

Layout.propTypes = {
  children: PropTypes.element.isRequired,
}

export default Layout

const Page = styled.div`
  display: grid;
  grid-template-columns: 1fr 700px 1fr;
  grid-gap: 0px;

  @media screen and (max-width: 700px) {
    grid-template-columns: 10px 1fr 10px;
  }
`

const Body = styled.section`
  grid-column: 2;
  grid-row: 3;
`

const Header = styled.header`
  grid-row: 1;
  padding-top: 10px;
  grid-column: 2;
  display: grid;
  grid-template-columns: 1fr 100px 100px;
  grid-gap: 10px;
  align-items: center;
  & > h1 {
    & > a {
      color: black;
      text-decoration: none;
    }
    @media screen and (max-width: 700px) {
      font-size: 1.6em;
    }
  }
`
const WriteButton = styled(Button)``

const StyledLink = styled(Link)`
  text-decoration: none;

  &:focus,
  &:hover,
  &:visited,
  &:link,
  &:active {
    text-decoration: none;
  }
`
