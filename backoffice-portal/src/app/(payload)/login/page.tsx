'use client'

import { useState } from 'react'
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // 1. Authenticate with Keycloak
      const keycloakResponse = await fetch('/api/auth/keycloak/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      })

      const keycloakData = await keycloakResponse.json()

      if (!keycloakResponse.ok) {
        throw new Error(keycloakData.error || 'Falha na autenticação')
      }

      // 2. Store Keycloak tokens for the AuthInterceptor
      if (keycloakData.access_token) {
        sessionStorage.setItem('keycloak_token', keycloakData.access_token)
        if (keycloakData.refresh_token) {
          sessionStorage.setItem('keycloak_refresh_token', keycloakData.refresh_token)
        }
        console.log('✅ Keycloak tokens stored in sessionStorage')
      }

      // 3. Login succeeded, PayloadCMS session should be created via cookie
      // Redirect directly to admin
      window.location.href = '/admin'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">LBPay Portal</h1>
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
                  Usuário: <strong>jose.silva</strong> | Senha: <strong>Test@123</strong>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500">© 2025 LBPay. Todos os direitos reservados.</p>
      </div>
    </div>
  )
}
