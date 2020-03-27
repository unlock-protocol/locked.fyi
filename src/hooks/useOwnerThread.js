import removeMarkdown from 'remove-markdown'
import { useState, useEffect, useReducer} from 'react'
import Box from '3box'
import {sortThread} from '../utils/sortThread'
import {parseNote} from '../utils/parseNote'

/**
 * util function to build the markdown file
 * @param {*} note
 */
const buildContent = (note) => {
  const locks = (note.attributes.locks || []).map(lock => {
    return `  - "${lock}"
`
  }).join('')
  return `---
id: ${note.attributes.id}
createdAt: ${note.attributes.createdAt || new Date().getTime()}
updatedAt: ${new Date().getTime()}
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

const newNote = (identity) => {
  return {
    attributes: {
      id: null,
      title: '',
      locks: [],
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
      author: `${identity}`
    },
    body: ""
  }
}


/**
 * Opens a thread for a user!
 */
export const useOwnerThread = (identity, index) => {
  const [loading, setLoading] = useState(true)
  const [thread, setThread] = useState(null)
  const [space, setSpace] = useState(null)
  const [saving, setSaving] = useState(false)
  const [postId, setPostId] = useState(null)
  const [note, dispatch] = useReducer(noteReducer, newNote(identity))

  useEffect(() => {
    const openSpace = async () => {
      setLoading(true)
      if(!identity) {
        setLoading(false)
        return
      }
      const box = await Box.openBox(identity, window.ethereum)
      const space = await box.openSpace('locked')
      setSpace(space)
      const thread = await space.joinThread('fyi', {
        members: true
      })
      setThread(thread)
      const items = sortThread(await thread.getPosts())
      // if there is an index, yield the note!
      // Otherwise yield a new note!
      const item = items.find(item => {
        return item?.note?.attributes?.id?.toString() === index
      })

      if(item) {
        setPostId(item.postId)
        const note = await parseNote(item)
        dispatch({
          type: 'setNote',
          note,
        })
      } else {
        dispatch({
          type: 'setNote',
          note: newNote(identity),
        })
      }
      setLoading(false)
    }

    openSpace()
  }, [identity, index])

  const setNoteAttribute = (attribute, value) => {
    dispatch({type: 'setAttribute', attribute, value})
  }

  /**
   * sets the note body
   * @param {*} body
   */
  const setNoteBody = (body) => {
    // We should try to extract the title from this!
    // The title is the first line
    const firstLine = body.split('\n')[0]
    setNoteAttribute('title', removeMarkdown(firstLine))
    dispatch({type: 'setBody', body})
  }

  /**
   * Saves a story!
   */
  const save = async () => {
    setSaving(true)
    if (postId) {
      await thread.deletePost(postId)
    }
    if (!note.attributes.id) {
      // This is a new note! Let's get the note index from the users' space
      // And increase it!
      let nextNoteId = await space.private.get('nextNoteId') + 1
      if (!nextNoteId) {
        nextNoteId = (await thread.getPosts()).length + 1
      }
      const nextNoteIdSaved = await space.private.set('nextNoteId', nextNoteId)
      if (!nextNoteIdSaved) {
        console.error('We could not save the next note id! Aborting save')
        return
      }
      note.attributes.id = nextNoteId
    }

    if (note.attributes.id) {
      const newPostId = await thread.post(buildContent(note))
      setPostId(newPostId)
      setSaving(false)
    } else {
      console.error('Could not get a postId')
      // show error?
    }
  }

  const destroy = async () => {
    setSaving(true)
    const confirmed = window.confirm('Are you sure? There is no recovery...')
    if (confirmed) {
      await thread.deletePost(postId)
      dispatch({
        type: 'setNote',
        note: newNote(identity),
      })
      setPostId(null)
    }
    setSaving(false)
  }

  return { setNoteAttribute, setNoteBody, thread, note, loading, save, postId, destroy, saving }

}