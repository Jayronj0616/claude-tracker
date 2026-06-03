'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Account } from '@/lib/types'
import AccountCard from '@/components/AccountCard'
import AccountModal from '@/components/AccountModal'

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
    setAccounts(data || [])
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
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-white text-2xl font-bold">Claude Tracker</h1>
          <div className="flex gap-3">
            <button
              onClick={handleAdd}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              + Add Account
            </button>
            <button
              onClick={handleLogout}
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm transition"
            >
              Logout
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-500 text-center mt-20">Loading...</p>
        ) : accounts.length === 0 ? (
          <p className="text-gray-500 text-center mt-20">No accounts yet. Add one to get started.</p>
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
