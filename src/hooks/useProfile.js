import { useState, useEffect } from "react"
import Box from "3box"

export const useProfile = (address) => {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState({})

  useEffect(() => {
    const getProfile = async () => {
      const boxProfile = await Box.getProfile(address.toString())
      setProfile(boxProfile)
      setLoading(false)
    }

    getProfile()
  }, [address])
  return { loading, profile }
}

export default useProfile
