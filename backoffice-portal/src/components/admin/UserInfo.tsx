'use client'

import { useAuth } from '@payloadcms/ui'

export const UserInfo = () => {
  const { user } = useAuth()

  if (!user) return null

  // Extract first and last name
  const getDisplayName = () => {
    if (user.name) {
      const nameParts = user.name.trim().split(' ')
      if (nameParts.length === 1) {
        return nameParts[0]
      }
      return `${nameParts[0]} ${nameParts[nameParts.length - 1]}`
    }

    // Fallback to email
    if (user.email) {
      const emailName = user.email.split('@')[0]
      const parts = emailName.split('.')
      if (parts.length >= 2) {
        return `${parts[0].charAt(0).toUpperCase() + parts[0].slice(1)} ${parts[parts.length - 1].charAt(0).toUpperCase() + parts[parts.length - 1].slice(1)}`
      }
      return emailName.charAt(0).toUpperCase() + emailName.slice(1)
    }

    return 'User'
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px 16px',
        color: 'var(--theme-text)',
        fontSize: '14px',
        fontWeight: 500,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
        }}
      >
        <span style={{ fontWeight: 600 }}>{getDisplayName()}</span>
        <span
          style={{
            fontSize: '12px',
            opacity: 0.7,
            fontWeight: 400,
          }}
        >
          {user.email}
        </span>
      </div>
    </div>
  )
}
