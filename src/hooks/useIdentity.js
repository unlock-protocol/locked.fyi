import { useState } from 'react'

export const useIdentity = (did) => {
  const [identity, setIdentity] = useState(null)

  const authenticate = async () => {
    const userAddresses = await window.ethereum.enable()
    setIdentity(userAddresses)
  }
  return {identity, authenticate}
}

export default useIdentity