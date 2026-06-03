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

function getStatus(next_available_at: string | null): { label: string; color: string } {
  if (!next_available_at) return { label: 'Available', color: 'text-green-400' }
  const diff = new Date(next_available_at).getTime() - Date.now()
  if (diff <= 0) return { label: 'Available', color: 'text-green-400' }

  const totalMinutes = Math.ceil(diff / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  const label = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  return { label: `Available in ${label}`, color: 'text-yellow-400' }
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
    const updated = account.task
      ? account.task + '\n' + newTask.trim()
      : newTask.trim()
    await supabase.from('accounts').update({ task: updated }).eq('id', account.id)
    setNewTask('')
    setAddingTask(false)
    setSaving(false)
    onRefresh()
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-white font-medium text-sm break-all">{account.email}</p>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => onEdit(account)}
            className="text-gray-400 hover:text-white text-xs transition"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(account.id)}
            className="text-red-500 hover:text-red-400 text-xs transition"
          >
            Delete
          </button>
        </div>
      </div>

      <p className={`text-sm font-semibold ${status.color}`}>{status.label}</p>

      {account.next_available_at && new Date(account.next_available_at).getTime() > Date.now() && (
        <p className="text-gray-500 text-xs">
          {new Date(account.next_available_at).toLocaleString()}
        </p>
      )}

      {tasks.length > 0 ? (
        <ul className="bg-gray-800 rounded-lg px-3 py-2 flex flex-col gap-1">
          {tasks.map((t, i) => (
            <li key={i} className="text-gray-300 text-sm flex gap-2">
              <span className="text-gray-500 mt-0.5">•</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600 text-sm italic">No task set</p>
      )}

      {addingTask ? (
        <div className="flex gap-2">
          <input
            autoFocus
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
            placeholder="New task..."
            className="flex-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleAddTask}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded-lg transition disabled:opacity-50"
          >
            {saving ? '...' : 'Save'}
          </button>
          <button
            onClick={() => { setAddingTask(false); setNewTask('') }}
            className="text-gray-500 hover:text-white text-xs px-2 transition"
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          onClick={() => setAddingTask(true)}
          className="text-blue-500 hover:text-blue-400 text-xs text-left transition"
        >
          + Add task
        </button>
      )}
    </div>
  )
}
