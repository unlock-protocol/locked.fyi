import { useState, useEffect } from 'react'
import Box from '3box'

export const useProfile = (address) => {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState({})

  useEffect(() => {
    const getProfile = async () => {
      const profile = await Box.getProfile(address.toString())
      setProfile(profile)
      setLoading(false)
    }

    getProfile()
  }, [address])
  return {loading, profile}
}

