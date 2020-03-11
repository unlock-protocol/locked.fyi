import { useState, useEffect} from 'react'
import Box from '3box'


/**
 * util function to build the markdown file
 * @param {*} note
 */
const buildContent = (note) => {
  const locks = note.attributes.locks.map(lock => {
    return `  - ${lock}
`
  }).join('')
  return `---
title: ${note.attributes.title}
author: ${note.attributes.author}
preview: ${note.attributes.preview}
locks:
${locks}
---
${note.body}`

}


/**
 * Opens a thread for a user!
 */
export const useOwnerThread = (identity) => {
  const [loading, setLoading] = useState(true)
  // we use Personal Open threads
  const [thread, setThread] = useState(null)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    const openSpace = async () => {
      if(!identity) {
        setLoading(false)
        return
      }
      const box = await Box.openBox(identity, window.ethereum)
      const space = await box.openSpace('locked')
      const thread = await space.joinThread('fyi', {
        members: true
      })
      setThread(thread)
      setLoading(false)
    }

    openSpace()
  }, [identity])


  const save = async (note) => {
    setSaved(false)
    setSaving(true)
    await thread.post(buildContent(note))
    setSaved(true)
    setSaving(false)
    // Mark as saved
    setTimeout(() => {
      setSaved(false)
    }, 1000)
  }

  return { thread, loading, save, saved, error, saving }

}