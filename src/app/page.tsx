'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async () => {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      localStorage.setItem('ct_auth', 'true')
      router.push('/dashboard')
    } else {
      setError('Incorrect password.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F0E8' }}>
      <div className="rounded-2xl p-8 w-full max-w-sm shadow-sm" style={{ backgroundColor: '#FFFEF9', border: '1px solid #E8E0D0' }}>
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold mb-1" style={{ color: '#2D2520' }}>Claude Tracker</h1>
          <p className="text-sm" style={{ color: '#8C7B6B' }}>Enter your password to continue</p>
        </div>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          className="w-full rounded-lg px-4 py-2.5 mb-3 text-sm focus:outline-none"
          style={{ backgroundColor: '#F5F0E8', border: '1px solid #DDD5C8', color: '#2D2520' }}
        />
        {error && <p className="text-sm mb-3" style={{ color: '#C0622F' }}>{error}</p>}
        <button
          onClick={handleLogin}
          className="w-full rounded-lg py-2.5 text-sm font-medium transition"
          style={{ backgroundColor: '#C0622F', color: '#FFFEF9' }}
        >
          Login
        </button>
      </div>
    </div>
  )
}
