import { useState } from "react"

export const useIdentity = () => {
  const [identity, setIdentity] = useState(null)

  const authenticate = async () => {
    if (window.ethereum) {
      const userAddresses = await window.ethereum.enable()
      setIdentity(userAddresses[0])
    } else {
      // eslint-disable-next-line no-alert
      alert("You need to use a browser with an injected web3 wallet!")
    }
  }
  return { identity, authenticate }
}

export default useIdentity
