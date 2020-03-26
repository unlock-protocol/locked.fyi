import styled from "styled-components"
import React from 'react';
import {Link} from "react-router-dom";
import {useIdentity} from '../hooks/useIdentity'

export const IdentityContext = React.createContext(null);


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
        {identity &&
        <nav>
          <span>You are {identity}!</span>
        </nav>}
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
