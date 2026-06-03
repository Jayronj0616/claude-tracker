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

const inputStyle = {
  backgroundColor: '#F5F0E8',
  border: '1px solid #DDD5C8',
  color: '#2D2520',
}

const labelStyle = { color: '#8C7B6B' }

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
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(45,37,32,0.4)' }}>
      <div className="rounded-2xl p-6 w-full max-w-md shadow-lg" style={{ backgroundColor: '#FFFEF9', border: '1px solid #E8E0D0' }}>
        <h2 className="font-semibold text-lg mb-5" style={{ color: '#2D2520' }}>
          {account ? 'Edit Account' : 'Add Account'}
        </h2>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs mb-1 block" style={labelStyle}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={inputStyle}
            />
          </div>

          <div>
            <label className="text-xs mb-1 block" style={labelStyle}>Next Available</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={clearTime}
                className="flex-1 rounded-lg px-3 py-2 text-sm focus:outline-none disabled:opacity-40"
                style={inputStyle}
              />
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                disabled={clearTime}
                className="flex-1 rounded-lg px-3 py-2 text-sm focus:outline-none disabled:opacity-40"
                style={inputStyle}
              >
                {timeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 mt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={clearTime}
                onChange={(e) => setClearTime(e.target.checked)}
                className="accent-orange-600"
              />
              <span className="text-xs" style={labelStyle}>Mark as available now (clear time)</span>
            </label>
          </div>

          <div>
            <label className="text-xs mb-1 block" style={labelStyle}>Tasks (one per line)</label>
            <textarea
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder={"Continue auth flow\nFix dashboard bug"}
              rows={3}
              className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none resize-none"
              style={inputStyle}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="text-sm px-4 py-2 transition"
            style={{ color: '#8C7B6B' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="text-sm px-5 py-2 rounded-lg transition"
            style={{ backgroundColor: '#C0622F', color: '#FFFEF9' }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
