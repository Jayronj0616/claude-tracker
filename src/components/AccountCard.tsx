'use client'

import { useEffect, useState } from 'react'
import { Account } from '@/lib/types'

type Props = {
  account: Account
  onEdit: (account: Account) => void
  onDelete: (id: string) => void
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

export default function AccountCard({ account, onEdit, onDelete }: Props) {
  const [status, setStatus] = useState(() => getStatus(account.next_available_at))

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(getStatus(account.next_available_at))
    }, 30000)
    return () => clearInterval(interval)
  }, [account.next_available_at])

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

      {account.task ? (
        <p className="text-gray-300 text-sm bg-gray-800 rounded-lg px-3 py-2">{account.task}</p>
      ) : (
        <p className="text-gray-600 text-sm italic">No task set</p>
      )}
    </div>
  )
}
