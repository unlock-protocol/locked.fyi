import React from 'react';
import {Link} from "react-router-dom";


export const Layout = ({children}) => {
  return <div>
  <h1>Locked.fyi</h1>
  <header>
    <Link to='/write'>Write</Link>
  </header>

  {children}

  </div>
}
export default Layout