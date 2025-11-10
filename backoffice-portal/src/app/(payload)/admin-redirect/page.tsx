'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    // Verificar se há token
    const token = sessionStorage.getItem('keycloak_token')

    if (token) {
      // Forçar navegação para admin
      window.location.href = '/admin'
    } else {
      // Sem token, redirecionar para login
      router.push('/login')
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecionando para o painel administrativo...</p>
      </div>
    </div>
  )
}
