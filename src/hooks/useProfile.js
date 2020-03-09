import { useState, useEffect } from 'react'
import Box from '3box'

export const useProfile = (did) => {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState({})

  useEffect(() => {

    const getProfile = async () => {
      const profile = await Box.getProfile(did)
      setProfile(profile)
      setLoading(false)
    }

    getProfile()
  }, [did])
  return {loading, profile}
}

