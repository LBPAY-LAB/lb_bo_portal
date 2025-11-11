'use client'

import React, { useEffect } from 'react'
import { useTheme } from '@payloadcms/ui'

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setTheme, theme: currentTheme } = useTheme()
  const [initialized, setInitialized] = React.useState(false)

  useEffect(() => {
    async function syncThemeWithPortalSettings() {
      try {
        const response = await fetch('/api/globals/portal-settings')
        if (response.ok) {
          const data = await response.json()
          const portalDefaultTheme = data.defaultTheme || 'light'
          const allowUserThemeSelection = data.allowUserThemeSelection ?? true

          // If user theme selection is disabled, always force portal default
          if (!allowUserThemeSelection) {
            if (currentTheme !== portalDefaultTheme) {
              setTheme(portalDefaultTheme)
              // Clear user preference from localStorage
              localStorage.removeItem('payload-theme')
              console.log(`🔒 Forced portal theme: ${portalDefaultTheme} (user selection disabled)`)
            }
          } else {
            // User theme selection is allowed
            const userThemePreference = localStorage.getItem('payload-theme')

            // If user has NO preference, apply portal default
            if (!userThemePreference && currentTheme !== portalDefaultTheme) {
              setTheme(portalDefaultTheme)
              console.log(`✅ Applied portal default theme: ${portalDefaultTheme}`)
            }
          }
        }

        setInitialized(true)
      } catch (error) {
        console.error('Failed to sync theme with portal settings:', error)
        setInitialized(true)
      }
    }

    // Run on mount and every 2 seconds to detect Portal Settings changes
    syncThemeWithPortalSettings()
    const interval = setInterval(syncThemeWithPortalSettings, 2000)

    return () => clearInterval(interval)
  }, [setTheme, currentTheme])

  return <>{children}</>
}
