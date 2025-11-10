import { headers as getHeaders } from 'next/headers.js'
import Image from 'next/image'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import './styles.css'

// Sistema de i18n - traduções do portal
const i18n = {
  'pt-BR': {
    welcomeGuest: 'Bem-vindo ao {portalName}',
    welcome: 'Bem-vindo',
    accessAdminPanel: 'Acessar Painel Administrativo',
  },
  'en-US': {
    welcomeGuest: 'Welcome to {portalName}',
    welcome: 'Welcome',
    accessAdminPanel: 'Access Admin Panel',
  },
  'es-ES': {
    welcomeGuest: 'Bienvenido al {portalName}',
    welcome: 'Bienvenido',
    accessAdminPanel: 'Acceder al Panel Administrativo',
  },
}

type Locale = keyof typeof i18n

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  // Buscar configurações do portal
  const portalSettings = await payload.findGlobal({
    slug: 'portal-settings',
  })

  // Pegar idioma do portal (defaultLanguage) ou fallback para pt-BR
  const locale = (portalSettings?.defaultLanguage as Locale) || 'pt-BR'
  const t = i18n[locale]

  // Nome do portal vem das configurações
  const portalName = portalSettings?.portalName || 'LB Portal Container'

  // Extrair primeiro e último nome do usuário
  const getUserDisplayName = () => {
    if (!user) return null

    // Se tem campo 'name', usar ele
    if (user.name) {
      const nameParts = user.name.trim().split(' ')
      if (nameParts.length === 1) {
        return nameParts[0]
      }
      return `${nameParts[0]} ${nameParts[nameParts.length - 1]}`
    }

    // Fallback: extrair do email
    if (user.email) {
      const emailName = user.email.split('@')[0]
      const parts = emailName.split('.')
      if (parts.length >= 2) {
        return `${parts[0].charAt(0).toUpperCase() + parts[0].slice(1)} ${parts[parts.length - 1].charAt(0).toUpperCase() + parts[parts.length - 1].slice(1)}`
      }
      return emailName.charAt(0).toUpperCase() + emailName.slice(1)
    }

    return 'Usuário'
  }

  const displayName = getUserDisplayName()

  return (
    <div className="home">
      <div className="content">
        <picture>
          <source srcSet="https://raw.githubusercontent.com/payloadcms/payload/main/packages/ui/src/assets/payload-favicon.svg" />
          <Image
            alt={`${portalName} Logo`}
            height={80}
            src="https://raw.githubusercontent.com/payloadcms/payload/main/packages/ui/src/assets/payload-favicon.svg"
            width={80}
          />
        </picture>
        {!user && <h1>{t.welcomeGuest.replace('{portalName}', portalName)}</h1>}
        {user && (
          <div className="welcome-message">
            <h1 className="brand-name">{portalName}</h1>
            <h2 className="greeting">
              {t.welcome}, {displayName}
            </h2>
          </div>
        )}
        <div className="links">
          <a className="admin" href={payloadConfig.routes.admin}>
            {t.accessAdminPanel}
          </a>
        </div>
      </div>
    </div>
  )
}
