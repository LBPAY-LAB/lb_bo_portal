'use client'

import React from 'react'
import { useAuth, useConfig, useTranslation, useTheme } from '@payloadcms/ui'
import Link from 'next/link'
import { useUserAvatar } from '@/providers/UserAvatarProvider'

export const HeaderRight: React.FC = () => {
  const { user: liveUser } = useAuth()
  const { i18n } = useTranslation()
  const config = useConfig()
  const { theme } = useTheme()
  const { avatarUrl: contextAvatarUrl, setAvatarUrl } = useUserAvatar()

  // Extract and save avatar URL to context once
  React.useEffect(() => {
    if (liveUser?.avatar && !contextAvatarUrl) {
      let url: string | null = null

      if (typeof liveUser.avatar === 'object' && 'url' in liveUser.avatar) {
        url = liveUser.avatar.url as string
      } else if (typeof liveUser.avatar === 'string') {
        url = liveUser.avatar
      }

      if (url) {
        setAvatarUrl(url)
      }
    }
  }, [liveUser, contextAvatarUrl, setAvatarUrl])

  // Use live user for display
  const user = liveUser
  const avatarUrl = contextAvatarUrl

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = event.target.value
    i18n.changeLanguage(newLang)
  }

  const supportedLanguages = config?.i18n?.supportedLanguages || {}
  const currentLanguage = i18n.language || 'en'

  const languageNames: Record<string, string> = {
    pt: 'Português',
    en: 'English',
    es: 'Español',
  }

  // Theme-aware colors
  const isDark = theme === 'dark'
  const bgColor = isDark ? 'var(--theme-elevation-100)' : 'var(--theme-elevation-50)'
  const bgHoverColor = isDark ? 'var(--theme-elevation-150)' : 'var(--theme-elevation-100)'
  const textColor = isDark ? 'var(--theme-elevation-800)' : 'var(--theme-elevation-1000)'
  const secondaryTextColor = isDark ? 'var(--theme-elevation-600)' : 'var(--theme-elevation-500)'
  const avatarBgColor = isDark ? 'var(--theme-elevation-200)' : 'var(--theme-elevation-100)'
  const iconColor = isDark ? 'var(--theme-elevation-500)' : 'var(--theme-elevation-400)'
  const borderColor = isDark ? 'var(--theme-elevation-200)' : 'var(--theme-elevation-150)'
  const selectBgColor = isDark ? 'var(--theme-elevation-100)' : 'var(--theme-bg)'

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginLeft: 'auto',
      }}
    >
      {/* Language Selector */}
      {Object.keys(supportedLanguages).length > 0 ? (
        <select
          value={currentLanguage}
          onChange={handleLanguageChange}
          style={{
            padding: '0.5rem',
            borderRadius: '4px',
            border: `1px solid ${borderColor}`,
            backgroundColor: selectBgColor,
            color: textColor,
            cursor: 'pointer',
            minWidth: '120px',
          }}
        >
          {Object.keys(supportedLanguages).map((lang) => (
            <option key={lang} value={lang}>
              {languageNames[lang] || lang.toUpperCase()}
            </option>
          ))}
        </select>
      ) : (
        <select
          style={{
            padding: '0.5rem',
            borderRadius: '4px',
            border: `1px solid ${borderColor}`,
            backgroundColor: selectBgColor,
            color: textColor,
            cursor: 'pointer',
            minWidth: '120px',
          }}
        >
          <option value="pt">Português</option>
          <option value="en">English</option>
          <option value="es">Español</option>
        </select>
      )}

      {/* User Info */}
      {user && (
        <Link
          href="/admin/account"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px 16px',
            borderRadius: '8px',
            backgroundColor: bgColor,
            textDecoration: 'none',
            transition: 'background-color 0.2s',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = bgHoverColor
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = bgColor
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: avatarBgColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'User'}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"
                  fill={iconColor}
                />
              </svg>
            )}
          </div>

          {/* User Info Text */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: textColor,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User'}
            </div>
            <div
              style={{
                fontSize: '12px',
                color: secondaryTextColor,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user.email}
            </div>
          </div>
        </Link>
      )}
    </div>
  )
}
