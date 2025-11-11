'use client'

import { useState, useEffect } from 'react'
import { Lock, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [portalName, setPortalName] = useState('Portal')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  // Fetch portal settings on mount
  useEffect(() => {
    async function fetchPortalSettings() {
      try {
        const response = await fetch('/api/globals/portal-settings')
        if (response.ok) {
          const data = await response.json()

          if (data.portalName) {
            setPortalName(data.portalName)
          }

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
        }
      } catch (error) {
        console.error('Failed to fetch portal settings:', error)
      }
    }

    fetchPortalSettings()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Authenticate with PayloadCMS local auth (NOT Keycloak)
      // This calls the built-in PayloadCMS login endpoint
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: username,  // PayloadCMS expects 'email', not 'username'
          password
        }),
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.errors?.[0]?.message || data.message || 'Falha na autenticação')
      }

      // Login succeeded, PayloadCMS session cookie is set automatically
      console.log('✅ Login successful:', data.message)

      // Redirect to admin dashboard
      window.location.href = '/admin'
    } catch (err) {
      console.error('❌ Login error:', err)
      setError(err instanceof Error ? err.message : 'Erro ao fazer login')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          {logoUrl ? (
            <div className="mx-auto mb-4 flex justify-center">
              <img
                src={logoUrl}
                alt={`${portalName} Logo`}
                className="h-20 w-auto object-contain"
              />
            </div>
          ) : (
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
              <Lock className="w-8 h-8 text-white" />
            </div>
          )}
          <h1 className="text-3xl font-bold text-gray-900">{portalName}</h1>
          <p className="text-gray-600 mt-2">Sistema de Gestão</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Acessar Portal</CardTitle>
            <CardDescription>Entre com suas credenciais para continuar</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuário</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Digite seu usuário"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar no Portal'
                )}
              </Button>
            </form>

            {/* Dev Credentials */}
            <div className="mt-6 pt-6 border-t">
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                <p className="text-xs font-semibold text-blue-900 mb-1">
                  Ambiente de Desenvolvimento
                </p>
                <p className="text-xs text-blue-700 font-mono">
                  Usuário: <strong>superadmin@lbpay.dev</strong> | Senha: <strong>Test@123</strong>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500">
          © {new Date().getFullYear()} {portalName}. Todos os direitos reservados.
        </p>
      </div>
    </div>
  )
}
