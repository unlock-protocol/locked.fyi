import { useState, useEffect } from 'react'

/*
 * Retrieves lock's metadata.
 */
export const useLockMetadata = (address) => {
  const [lock, setLock] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  const getLockMetadata = async (address) => {
    try {
      const response = await fetch(`http://locksmith.unlock-protocol.com/lock/${address}`)
      const lock = await response.json()
      setLock(lock)
    } catch (_e) {
      setError('We could not retrieve notes for this lock.')
    }
    setLoading(false)
  }

  useEffect(() => {
    getLockMetadata(address)
  }, [address])
  return {lock, error, loading}
}

