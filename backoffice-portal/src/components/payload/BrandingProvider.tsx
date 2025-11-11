'use client'

import { useEffect } from 'react'

export const BrandingProvider = () => {
  useEffect(() => {
    // Fetch portal settings and apply brand colors
    const applyBrandColors = async () => {
      try {
        const response = await fetch('/api/globals/portal-settings', {
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()

          // Apply brand colors as CSS variables
          if (data.primaryColor) {
            document.documentElement.style.setProperty('--portal-primary', data.primaryColor)
          }

          if (data.secondaryColor) {
            document.documentElement.style.setProperty('--portal-secondary', data.secondaryColor)
          }

          console.log('✅ Brand colors applied:', {
            primary: data.primaryColor,
            secondary: data.secondaryColor,
          })
        }
      } catch (error) {
        console.error('Failed to fetch and apply brand colors:', error)
      }
    }

    applyBrandColors()
  }, [])

  // This component doesn't render anything, it just applies CSS variables
  return null
}
