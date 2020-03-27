import styled from "styled-components"
import React from 'react';
import {Link} from "react-router-dom";
import {useIdentity} from '../hooks/useIdentity'
import {useProfile} from '../hooks/useProfile'

export const IdentityContext = React.createContext(null);

const emoji = ['👊','👌','🙌','👋','👍','🖖']

export const ConnectUser = ({address}) => {
  const {loading, profile} = useProfile(address)
  if(loading) {
    return <Identity>&nbsp;</Identity>
  }

  const handEmoji = new Date().getHours() % emoji.length

  let name = profile.name || address

  return (
      <Identity title={name}>
        <Emoji role="img" aria-label="hi!">{emoji[handEmoji]}</Emoji>
        {name.split(/[ ,]+/)[0].substring(0, 7)}
      </Identity>
   )
}


export const Layout = ({children}) => {
  const {authenticate, identity} = useIdentity()

  return <IdentityContext.Provider value={identity}>
    <Page>
      <Header>
        <h1>Locked.fyi</h1>
        {!identity &&
        <nav>
          <AuthenticateButton onClick={authenticate}>Log-in</AuthenticateButton>
        </nav>}
        {identity && <nav><ConnectUser address={identity} /></nav>}
        <nav>
          <StyledLink to='/write'><WriteButton>Write</WriteButton></StyledLink>
        </nav>
      </Header>

      <Body>
      {children}

      </Body>
    </Page>
  </IdentityContext.Provider>
}

export default Layout


const Page =styled.div`
  display: grid;
  grid-template-columns: 1fr 700px 1fr;
  grid-gap: 0px;

  @media screen and (max-width: 700px){
    grid-template-columns: 10px 1fr 10px;
  }

`

const Body = styled.section`
  grid-column: 2;
  grid-row: 3;
`

const Header =styled.header`
  grid-row: 1;
  padding-top: 10px;
  grid-column: 2;
  display: grid;
  grid-template-columns: 1fr 100px 100px;
  grid-gap: 10px;
  align-items: center;
  &>h1 {
    @media screen and (max-width: 700px){
      font-size: 1.6em;
    }
  }
`

const Button=styled.button`
  font-size: 0.8em;
  width: 100px;
  height: 40px;
  border: none;
  border-radius: 4px;
  padding: 10px;
  display: block;
  text-decoration:none;
  cursor: pointer;
  background-color: #ff6771;
  color: white;
  font-weight: bold;
  &:hover {
    box-shadow: 1px 2px 2px rgba(0, 0, 0, .3);
  }
  display: flex;
  justify-content: center;
`

const AuthenticateButton = styled(Button)`
`

const WriteButton = styled(Button)`
`

const StyledLink = styled(Link)`
    text-decoration: none;

    &:focus, &:hover, &:visited, &:link, &:active {
        text-decoration: none;
    }
`;

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