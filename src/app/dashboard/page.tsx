'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Account } from '@/lib/types'
import AccountCard from '@/components/AccountCard'
import AccountModal from '@/components/AccountModal'

function sortAccounts(accounts: Account[]): Account[] {
  return [...accounts].sort((a, b) => {
    const now = Date.now()
    const aAvail = !a.next_available_at || new Date(a.next_available_at).getTime() <= now
    const bAvail = !b.next_available_at || new Date(b.next_available_at).getTime() <= now
    if (aAvail && !bAvail) return -1
    if (!aAvail && bAvail) return 1
    if (!aAvail && !bAvail) {
      return new Date(a.next_available_at!).getTime() - new Date(b.next_available_at!).getTime()
    }
    return 0
  })
}

export default function DashboardPage() {
  const router = useRouter()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)

  useEffect(() => {
    if (localStorage.getItem('ct_auth') !== 'true') {
      router.push('/')
      return
    }
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    const { data } = await supabase
      .from('accounts')
      .select('*')
      .order('created_at', { ascending: true })
    setAccounts(sortAccounts(data || []))
    setLoading(false)
  }

  const handleAdd = () => {
    setEditingAccount(null)
    setModalOpen(true)
  }

  const handleEdit = (account: Account) => {
    setEditingAccount(account)
    setModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    await supabase.from('accounts').delete().eq('id', id)
    fetchAccounts()
  }

  const handleSave = async (data: Partial<Account>) => {
    if (editingAccount) {
      await supabase.from('accounts').update(data).eq('id', editingAccount.id)
    } else {
      await supabase.from('accounts').insert(data)
    }
    setModalOpen(false)
    fetchAccounts()
  }

  const handleLogout = () => {
    localStorage.removeItem('ct_auth')
    router.push('/')
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#F5F0E8' }}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold" style={{ color: '#2D2520' }}>Claude Tracker</h1>
          <div className="flex gap-3">
            <button
              onClick={handleAdd}
              className="px-4 py-2 rounded-lg text-sm font-medium transition"
              style={{ backgroundColor: '#C0622F', color: '#FFFEF9' }}
            >
              + Add Account
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg text-sm transition"
              style={{ backgroundColor: '#E8E0D0', color: '#8C7B6B' }}
            >
              Logout
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-center mt-20" style={{ color: '#8C7B6B' }}>Loading...</p>
        ) : accounts.length === 0 ? (
          <p className="text-center mt-20" style={{ color: '#8C7B6B' }}>No accounts yet. Add one to get started.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((acc) => (
              <AccountCard
                key={acc.id}
                account={acc}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onRefresh={fetchAccounts}
              />
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <AccountModal
          account={editingAccount}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}
