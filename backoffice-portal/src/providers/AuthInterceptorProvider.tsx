'use client'

import { useEffect } from 'react'

export function AuthInterceptorProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Salvar a função fetch original
    const originalFetch = window.fetch

    // Sobrescrever a função fetch global
    window.fetch = async (...args) => {
      const [resource, config] = args

      // Pegar o token do sessionStorage
      const token = sessionStorage.getItem('keycloak_token')

      // Se temos um token e a requisição é para a API do Payload
      if (token && typeof resource === 'string' && resource.startsWith('/api/')) {
        const headers = new Headers(config?.headers)

        // Adicionar o cabeçalho Authorization apenas se não existir
        if (!headers.has('authorization') && !headers.has('Authorization')) {
          headers.set('Authorization', `Bearer ${token}`)

          console.log('🔑 Interceptor: Token adicionado à requisição', {
            url: resource,
            hasToken: true,
          })
        }

        // Fazer a requisição com o header modificado
        return originalFetch(resource, {
          ...config,
          headers,
        })
      }

      // Caso contrário, usar a função fetch original
      return originalFetch(...args)
    }

    // Cleanup: restaurar fetch original quando o componente for desmontado
    return () => {
      window.fetch = originalFetch
    }
  }, [])

  return <>{children}</>
}
