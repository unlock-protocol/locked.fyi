import { useState, useEffect, useReducer} from 'react'
import Box from '3box'
import FrontMatter from 'front-matter'

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
author: "${note.attributes.author}"
locks:
${locks}
---
${note.body}`

}

const noteReducer = (state, action) => {
  switch (action.type) {
    case 'setNote':
      return {
        ...action.note
      }
    case 'setAttribute':
      return {
        attributes: {
          ...state.attributes,
          [action.attribute]: action.value
        },
        body: state.body
      }
      case 'setBody':
        return {
          ...state,
          'body': action.body
        }
      default:
        // Un supported!
  }
  return state
}


/**
 * Opens a thread for a user!
 */
export const useOwnerThread = (identity, index) => {
  const [loading, setLoading] = useState(true)
  const [thread, setThread] = useState(null)
  const [saving, setSaving] = useState(false)
  const [note, dispatch] = useReducer(noteReducer, {
    attributes: {
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
      author: `${identity}`
    },
    body: ""
  })

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
      const items = await thread.getPosts()
      // if there is an index, yield the note!
      // Otherwise yield a new note!
      const item = items[index]
      if(item) {
        const note = FrontMatter(item.message)
        dispatch({
          type: 'setNote',
          note,
        })
      }
      setThread(thread)
      setLoading(false)
    }

    openSpace()
  }, [identity, index])

  const setNoteAttribute = (attribute, value) => {
    dispatch({type: 'setAttribute', attribute, value})
  }

  const setNoteBody = (body) => {
    dispatch({type: 'setBody', body})
  }

  const save = async () => {
    setSaving(true)
    await thread.post(buildContent(note))
    setSaving(false)
  }

  return { setNoteAttribute, setNoteBody, thread, note, loading, save, saving }

}