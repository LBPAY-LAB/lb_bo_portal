import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: 'Username e password são obrigatórios' }, { status: 400 })
    }

    // 1. Autenticar no Keycloak
    const keycloakResponse = await fetch(
      `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'password',
          client_id: process.env.KEYCLOAK_CLIENT_ID!,
          client_secret: process.env.KEYCLOAK_CLIENT_SECRET!,
          username,
          password,
          scope: 'openid profile email',
        }),
      },
    )

    if (!keycloakResponse.ok) {
      const errorData = await keycloakResponse.json()
      return NextResponse.json(
        { error: errorData.error_description || 'Credenciais inválidas' },
        { status: 401 },
      )
    }

    const tokens = await keycloakResponse.json()

    if (!tokens.access_token) {
      return NextResponse.json({ error: 'Token de acesso não retornado pelo Keycloak' }, { status: 500 })
    }

    // 2. Decodificar o token para obter informações do usuário
    const base64Payload = tokens.access_token.split('.')[1]
    const decodedPayload = JSON.parse(Buffer.from(base64Payload, 'base64').toString())
    const { sub, email: keycloakEmail, preferred_username, given_name, family_name } = decodedPayload

    // 3. Inicializar Payload
    const payload = await getPayload({ config })

    // 4. Buscar ou criar o shadow user
    const existingUsers = await payload.find({
      collection: 'users',
      where: {
        keycloak_sub: {
          equals: sub,
        },
      },
      limit: 1,
    })

    let user
    if (existingUsers.docs.length > 0) {
      user = existingUsers.docs[0]

      // Sempre atualizar email, name E senha (para permitir login programático)
      user = await payload.update({
        collection: 'users',
        id: user.id,
        data: {
          email: keycloakEmail || `${preferred_username}@keycloak.local`,
          name: given_name && family_name ? `${given_name} ${family_name}` : preferred_username,
          password: sub, // Atualizar senha para keycloak_sub
        },
      })
    } else {
      // Criar novo shadow user usando keycloak_sub como senha
      // Isso permite fazer login programático depois
      user = await payload.create({
        collection: 'users',
        data: {
          email: keycloakEmail || `${preferred_username}@keycloak.local`,
          name: given_name && family_name ? `${given_name} ${family_name}` : preferred_username,
          keycloak_sub: sub,
          password: sub, // Usar keycloak_sub como senha para login programático
        },
      })
    }

    // 5. Fazer login programático no Payload usando a API interna
    // Isso garante que o PayloadCMS gerencie a sessão corretamente
    const loginResult = await payload.login({
      collection: 'users',
      data: {
        email: user.email!,
        password: user.keycloak_sub, // Usar keycloak_sub como senha (funciona porque shadow user foi criado assim)
      },
      req: {
        payload,
      } as any,
    })

    console.log('✅ Login successful via Keycloak, PayloadCMS session created')

    // 6. Retornar resposta com token do Keycloak para o frontend
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      // Retornar o access_token do Keycloak para ser armazenado no sessionStorage
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      // Incluir o token do Payload também
      payload_token: loginResult.token,
    })

    // Definir cookie de sessão do PayloadCMS
    const cookiePrefix = payload.config.cookiePrefix || 'payload'
    response.cookies.set(`${cookiePrefix}-token`, loginResult.token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: loginResult.exp! - Math.floor(Date.now() / 1000),
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      {
        error: 'Erro ao fazer login',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
