'use client'

import { useEffect, useState } from 'react'
import { Account } from '@/lib/types'
import { supabase } from '@/lib/supabase'

type Props = {
  account: Account
  onEdit: (account: Account) => void
  onDelete: (id: string) => void
  onRefresh: () => void
}

function getStatus(next_available_at: string | null): { label: string; available: boolean; since?: string } {
  if (!next_available_at) return { label: 'Available', available: true }
  const diff = new Date(next_available_at).getTime() - Date.now()
  if (diff <= 0) {
    const since = new Date(next_available_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    return { label: 'Available', available: true, since: `since ${since}` }
  }

  const totalMinutes = Math.ceil(diff / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  const label = hours > 0 ? `Available in ${hours}h ${minutes}m` : `Available in ${minutes}m`
  return { label, available: false }
}

export default function AccountCard({ account, onEdit, onDelete, onRefresh }: Props) {
  const [status, setStatus] = useState(() => getStatus(account.next_available_at))
  const [addingTask, setAddingTask] = useState(false)
  const [newTask, setNewTask] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setStatus(getStatus(account.next_available_at))
    const interval = setInterval(() => {
      setStatus(getStatus(account.next_available_at))
    }, 10000)
    return () => clearInterval(interval)
  }, [account.next_available_at])

  const tasks = account.task
    ? account.task.split('\n').map(t => t.trim()).filter(Boolean)
    : []

  const handleAddTask = async () => {
    if (!newTask.trim()) return
    setSaving(true)
    const updated = account.task ? account.task + '\n' + newTask.trim() : newTask.trim()
    await supabase.from('accounts').update({ task: updated }).eq('id', account.id)
    setNewTask('')
    setAddingTask(false)
    setSaving(false)
    onRefresh()
  }

  const handleClearTasks = async () => {
    await supabase.from('accounts').update({ task: null }).eq('id', account.id)
    onRefresh()
  }

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3 shadow-sm"
      style={{ backgroundColor: '#FFFEF9', border: '1px solid #E8E0D0' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium break-all" style={{ color: '#2D2520' }}>{account.email}</p>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => onEdit(account)}
            className="text-xs transition"
            style={{ color: '#8C7B6B' }}
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(account.id)}
            className="text-xs transition"
            style={{ color: '#C0622F' }}
          >
            Delete
          </button>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2">
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: status.available ? '#6A9E6F' : '#C9974A' }}
        />
        <span className="text-sm font-medium" style={{ color: status.available ? '#6A9E6F' : '#C9974A' }}>
          {status.label}
        </span>
        {status.since && (
          <span className="text-xs" style={{ color: '#8C7B6B' }}>{status.since}</span>
        )}
      </div>

      {!status.available && account.next_available_at && (
        <p className="text-xs" style={{ color: '#B0A090' }}>
          {new Date(account.next_available_at).toLocaleString()}
        </p>
      )}

      {/* Tasks */}
      {tasks.length > 0 ? (
        <div className="rounded-lg px-3 py-2 flex flex-col gap-1" style={{ backgroundColor: '#F5F0E8' }}>
          {tasks.map((t, i) => (
            <div key={i} className="text-sm flex gap-2" style={{ color: '#4A3F35' }}>
              <span style={{ color: '#B0A090' }} className="mt-0.5">•</span>
              <span>{t}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm italic" style={{ color: '#B0A090' }}>No tasks</p>
      )}

      {/* Add task inline */}
      {addingTask ? (
        <div className="flex gap-2">
          <input
            autoFocus
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
            placeholder="New task..."
            className="flex-1 rounded-lg px-3 py-1.5 text-sm focus:outline-none"
            style={{ backgroundColor: '#F5F0E8', border: '1px solid #DDD5C8', color: '#2D2520' }}
          />
          <button
            onClick={handleAddTask}
            disabled={saving}
            className="text-xs px-3 py-1.5 rounded-lg transition"
            style={{ backgroundColor: '#C0622F', color: '#FFFEF9', opacity: saving ? 0.5 : 1 }}
          >
            {saving ? '...' : 'Save'}
          </button>
          <button
            onClick={() => { setAddingTask(false); setNewTask('') }}
            className="text-xs px-2 transition"
            style={{ color: '#B0A090' }}
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setAddingTask(true)}
            className="text-xs transition"
            style={{ color: '#C0622F' }}
          >
            + Add task
          </button>
          {tasks.length > 0 && (
            <button
              onClick={handleClearTasks}
              className="text-xs transition"
              style={{ color: '#B0A090' }}
            >
              Clear tasks
            </button>
          )}
        </div>
      )}
    </div>
  )
}
