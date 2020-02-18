import { useState, useEffect } from 'react'
import Ipfs from 'ipfs-http-client'
import FrontMatter from 'front-matter'

const ipfs = Ipfs('https://ipfs.infura.io:5001/api/v0') // (the default in Node.js)

/*
 * Loads content of a note stored in IPFS
 */
export const useIpfsNote = (cid) => {
  const [note, setNote] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  const get = async (cid) => {
    try {
      const chunks = []
      for await (const chunk of ipfs.cat(cid)) {
        chunks.push(chunk)
      }
      const file = Buffer.concat(chunks).toString()
      setNote(FrontMatter(file))
    } catch (_e) {
      setError('We could not retrieve this note from IPFS! Has it been deleted?')
    }
    setLoading(false)
  }

  useEffect(() => {
    get(cid)
  }, [cid])
  return {note, loading, error}
}

