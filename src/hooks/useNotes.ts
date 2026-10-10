import { useCallback, useEffect, useState } from 'react'
import type { Note, NoteInput } from '../lib/types'
import { notesService } from '../services'

export function useNotes(userId: string) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    setLoading(true); setError('')
    notesService.list(userId).then(setNotes).catch((e: Error) => setError(e.message)).finally(() => setLoading(false))
  }, [userId])
  useEffect(load, [load])

  const create = async (input: NoteInput = {}) => {
    const n = await notesService.create(userId, input)
    setNotes((p) => [n, ...p])
    return n
  }
  const update = async (id: string, input: NoteInput) => {
    const n = await notesService.update(id, input)
    setNotes((p) => p.map((x) => (x.id === id ? n : x)))
    return n
  }
  const remove = async (id: string) => {
    await notesService.remove(id)
    setNotes((p) => p.filter((x) => x.id !== id))
  }
  return { notes, loading, error, reload: load, create, update, remove }
}
