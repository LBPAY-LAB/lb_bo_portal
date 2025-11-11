'use client'

import React from 'react'

export const Logo = () => {
  const [logoUrl, setLogoUrl] = React.useState<string>('/media/logoLBPAY.svg')
  const [portalName, setPortalName] = React.useState<string>('LB Portal')

  React.useEffect(() => {
    async function fetchPortalSettings() {
      try {
        const response = await fetch('/api/globals/portal-settings')
        if (response.ok) {
          const data = await response.json()

          // Extract logo URL from portal settings
          if (data.logo) {
            let url: string | null = null
            if (typeof data.logo === 'object' && 'url' in data.logo) {
              url = data.logo.url as string
            } else if (typeof data.logo === 'string') {
              url = data.logo
            }
            if (url) {
              setLogoUrl(url)
            }
          }

          // Extract portal name
          if (data.portalName) {
            setPortalName(data.portalName)
          }
        }
      } catch (error) {
        console.error('Failed to fetch portal settings:', error)
      }
    }

    fetchPortalSettings()
  }, [])

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        width: '100%',
      }}
    >
      <img
        src={logoUrl}
        alt={`${portalName} Logo`}
        style={{
          width: '240px',
          maxWidth: '100%',
          height: 'auto',
          objectFit: 'contain',
        }}
      />
    </div>
  )
}

// Icon version (smaller, for nav/favicons)
export const Icon = () => {
  const [logoUrl, setLogoUrl] = React.useState<string>('/media/logoLBPAY.svg')
  const [portalName, setPortalName] = React.useState<string>('LB Portal')

  React.useEffect(() => {
    async function fetchPortalSettings() {
      try {
        const response = await fetch('/api/globals/portal-settings')
        if (response.ok) {
          const data = await response.json()

          // Extract logo URL from portal settings
          if (data.logo) {
            let url: string | null = null
            if (typeof data.logo === 'object' && 'url' in data.logo) {
              url = data.logo.url as string
            } else if (typeof data.logo === 'string') {
              url = data.logo
            }
            if (url) {
              setLogoUrl(url)
            }
          }

          // Extract portal name
          if (data.portalName) {
            setPortalName(data.portalName)
          }
        }
      } catch (error) {
        console.error('Failed to fetch portal settings:', error)
      }
    }

    fetchPortalSettings()
  }, [])

  return (
    <img
      src={logoUrl}
      alt={`${portalName} Icon`}
      style={{
        width: '32px',
        height: '32px',
        objectFit: 'contain',
      }}
    />
  )
}
