'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export const LogoutButton = () => {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      // Call logout endpoint
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })

      if (response.ok) {
        // Redirect to login page
        router.push('/login')
        router.refresh()
      }
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="logout-button"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        background: 'transparent',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '4px',
        color: 'var(--theme-text)',
        cursor: 'pointer',
        fontSize: '14px',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
      }}
    >
      <LogOut size={16} />
      <span>Logout</span>
    </button>
  )
}
