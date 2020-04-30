import styled from "styled-components"
import React from "react"
import { useWeb3React } from "@web3-react/core"
import { InjectedConnector } from "@web3-react/injected-connector"
import { Button } from "./Button"

export const Authenticate = () => {
  const { activate } = useWeb3React()

  const connector = new InjectedConnector({
    supportedChainIds: [1, 3, 4, 5, 42],
  })

  return (
    <AuthenticateButton onClick={() => activate(connector)}>
      Log-in
    </AuthenticateButton>
  )
}

const AuthenticateButton = styled(Button)``

export default Authenticate
