'use client'

import { useEffect, useState } from 'react'

export const Icon = () => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  useEffect(() => {
    // Fetch portal settings to get logo for icon
    const fetchPortalSettings = async () => {
      try {
        const response = await fetch('/api/globals/portal-settings', {
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()

          // Set logo URL if exists
          if (data.logo && typeof data.logo === 'object' && data.logo.url) {
            setLogoUrl(data.logo.url)
          } else if (typeof data.logo === 'string') {
            setLogoUrl(data.logo)
          }
        }
      } catch (error) {
        console.error('Failed to fetch portal settings:', error)
      }
    }

    fetchPortalSettings()
  }, [])

  // If we have a custom logo, render it
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt="Portal Icon"
        style={{
          height: '30px',
          width: '30px',
          objectFit: 'contain',
        }}
      />
    )
  }

  // Fallback to gradient circle with initials
  return (
    <div
      style={{
        width: '30px',
        height: '30px',
        borderRadius: '6px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 700,
        fontSize: '14px',
      }}
    >
      LB
    </div>
  )
}
