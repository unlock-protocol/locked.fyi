import PropTypes from "prop-types"
import styled from "styled-components"
import React from "react"
import { Link } from "react-router-dom"
import { useWeb3React, UnsupportedChainIdError } from "@web3-react/core"
import { InjectedConnector } from "@web3-react/injected-connector"
import { useProfile } from "../hooks/useProfile"
import { threadPath, writePath } from "../utils/paths"

const emoji = ["👊", "👌", "🙌", "👋", "👍", "🖖"]

export const ConnectUser = ({ address }) => {
  const { loading, profile } = useProfile(address)
  if (loading) {
    return <Identity>&nbsp;</Identity>
  }

  const handEmoji = new Date().getHours() % emoji.length

  const name = profile.name || address

  return (
    <Identity title={name}>
      <Emoji role="img" aria-label="hi!">
        {emoji[handEmoji]}
      </Emoji>
      <Link to={threadPath(address)}>
        {name.split(/[ ,]+/)[0].substring(0, 7)}
      </Link>
    </Identity>
  )
}

ConnectUser.propTypes = {
  address: PropTypes.string.isRequired,
}

export const Layout = ({ children }) => {
  const { account, activate } = useWeb3React()

  const connector = new InjectedConnector({
    supportedChainIds: [1, 3, 4, 5, 42],
  })

  return (
    <Page>
      <Header>
        <h1>
          <Link to="/">Locked.fyi</Link>
        </h1>
        {!account && (
          <nav>
            <AuthenticateButton onClick={() => activate(connector)}>
              Log-in
            </AuthenticateButton>
          </nav>
        )}
        {account && (
          <nav>
            <ConnectUser address={account} />
          </nav>
        )}
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

export const Button = styled.button`
  font-size: 0.8em;
  width: 100px;
  height: 40px;
  border: none;
  border-radius: 4px;
  padding: 10px;
  display: block;
  text-decoration: none;
  cursor: pointer;
  background-color: #ff6771;
  &:disabled {
    background-color: #cccccc;
  }
  color: white;
  font-weight: bold;
  &:hover {
    box-shadow: 1px 2px 2px rgba(0, 0, 0, 0.3);
  }
  display: flex;
  justify-content: center;
`

const AuthenticateButton = styled(Button)``

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

const Identity = styled.abbr`
  border-bottom: none !important;
  cursor: inherit !important;
  text-decoration: none !important;
  display: flex;
  align-items: center;
  align-content: center;
`

const Emoji = styled.span`
  display: inline-block;
  font-size: 0.8em;
  margin-right: 3px;
`
