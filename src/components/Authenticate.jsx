import styled from "styled-components"
import React from "react"
import { useWeb3React } from "@web3-react/core"
import { WalletConnectConnector } from "@web3-react/walletconnect-connector"
import { InjectedConnector } from "@web3-react/injected-connector"
import { Button } from "./Button"
import { Qr } from "./Icons/Qr"

export const Authenticate = () => {
  const { activate } = useWeb3React()
  const injectedConnector = new InjectedConnector({
    supportedChainIds: [1, 3, 4, 5, 42],
  })

  const walletConnectConnector = new WalletConnectConnector({
    rpc: {
      1: "https://eth-mainnet.alchemyapi.io/v2/GUEohLZ1A5Sv0e5mnfOu0lvF6kwfgkyc",
    },
    bridge: "https://bridge.walletconnect.org",
    qrcode: true,
    pollingInterval: 12000,
  })

  return (
    <Buttons>
      <AuthenticateButton onClick={() => activate(injectedConnector)}>
        Log-in
      </AuthenticateButton>
      <WalletConnectButton onClick={() => activate(walletConnectConnector)}>
        <Qr height={20} width={20} />
      </WalletConnectButton>
    </Buttons>
  )
}

const Buttons = styled.div`
  display: grid;
  grid-gap: 1px;
  grid-template-columns: repeat(2, 1fr);
`
const AuthenticateButton = styled(Button)`
  width: 100px;
`

const WalletConnectButton = styled(Button)`
  width: 40px;
`

export default Authenticate
