import React from 'react';
import {Link} from "react-router-dom";


export const Layout = ({children}) => {
  return <page>
  <h1>Locked.fyi</h1>
  <header>
    <Link to='/write'>Write</Link>
  </header>

  {children}

  </page>
}
export default Layout