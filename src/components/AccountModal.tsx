'use client'

import { useState } from 'react'
import { Account } from '@/lib/types'

type Props = {
  account: Account | null
  onSave: (data: Partial<Account>) => void
  onClose: () => void
}

function generateTimeOptions() {
  const options = []
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 10) {
      const hour = h.toString().padStart(2, '0')
      const min = m.toString().padStart(2, '0')
      const suffix = h < 12 ? 'AM' : 'PM'
      const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h
      options.push({
        value: `${hour}:${min}`,
        label: `${displayHour}:${min} ${suffix}`,
      })
    }
  }
  return options
}

const timeOptions = generateTimeOptions()

function toLocalDatetimeValue(isoString: string) {
  const d = new Date(isoString)
  const year = d.getFullYear()
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  const hours = d.getHours().toString().padStart(2, '0')
  const mins = d.getMinutes().toString().padStart(2, '0')
  return { date: `${year}-${month}-${day}`, time: `${hours}:${mins}` }
}

export default function AccountModal({ account, onSave, onClose }: Props) {
  const existing = account?.next_available_at
    ? toLocalDatetimeValue(account.next_available_at)
    : null

  const [email, setEmail] = useState(account?.email || '')
  const [date, setDate] = useState(existing?.date || new Date().toISOString().split('T')[0])
  const [time, setTime] = useState(existing?.time || '08:00')
  const [task, setTask] = useState(account?.task || '')
  const [clearTime, setClearTime] = useState(false)

  const handleSave = () => {
    if (!email.trim()) return

    let next_available_at: string | null = null
    if (!clearTime) {
      const combined = new Date(`${date}T${time}:00`)
      next_available_at = combined.toISOString()
    }

    onSave({ email: email.trim(), next_available_at, task: task.trim() || null })
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md">
        <h2 className="text-white font-bold text-lg mb-5">
          {account ? 'Edit Account' : 'Add Account'}
        </h2>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-gray-400 text-xs mb-1 block">Next Available</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={clearTime}
                className="flex-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 disabled:opacity-40"
              />
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                disabled={clearTime}
                className="flex-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 disabled:opacity-40"
              >
                {timeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 mt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={clearTime}
                onChange={(e) => setClearTime(e.target.checked)}
                className="accent-blue-500"
              />
              <span className="text-gray-400 text-xs">Mark as available now (clear time)</span>
            </label>
          </div>

          <div>
            <label className="text-gray-400 text-xs mb-1 block">Task / Note</label>
            <textarea
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="e.g. Continue building the auth flow..."
              rows={3}
              className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-sm px-4 py-2 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-5 py-2 rounded-lg transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
