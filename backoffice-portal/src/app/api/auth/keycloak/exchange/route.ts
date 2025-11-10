import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import * as jose from 'jose'

export async function POST(request: NextRequest) {
  try {
    const { access_token, id_token } = await request.json()

    if (!access_token || !id_token) {
      return NextResponse.json(
        { error: 'Missing access_token or id_token' },
        { status: 400 },
      )
    }

    // 1. Validar e decodificar o ID token do Keycloak
    const JWKS_URI = `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/certs`
    const JWKS = jose.createRemoteJWKSet(new URL(JWKS_URI))

    const { payload: idTokenPayload } = await jose.jwtVerify(id_token, JWKS, {
      issuer: process.env.KEYCLOAK_ISSUER,
      audience: process.env.KEYCLOAK_CLIENT_ID,
    })

    // 2. Extrair informações do usuário
    const keycloakSub = idTokenPayload.sub as string
    const email = idTokenPayload.email as string
    const givenName = idTokenPayload.given_name as string
    const familyName = idTokenPayload.family_name as string
    const name = `${givenName} ${familyName}`.trim()

    // 3. Inicializar Payload
    const config = await configPromise
    const payload = await getPayload({ config })

    // 4. Buscar ou criar shadow user
    const existingUsers = await payload.find({
      collection: 'users',
      where: {
        keycloak_sub: {
          equals: keycloakSub,
        },
      },
      limit: 1,
    })

    let user
    if (existingUsers.docs.length > 0) {
      // Atualizar usuário existente
      user = await payload.update({
        collection: 'users',
        id: existingUsers.docs[0].id,
        data: {
          email,
          name,
          // Atualizar outros campos se necessário
        },
      })
    } else {
      // Criar novo shadow user
      user = await payload.create({
        collection: 'users',
        data: {
          email,
          name,
          keycloak_sub: keycloakSub,
          password: Math.random().toString(36), // Senha aleatória (nunca será usada)
        },
      })
    }

    // 5. Criar sessão do Payload
    const token = await payload.login({
      collection: 'users',
      data: {
        email,
        password: '', // Não usado, pois já autenticamos via Keycloak
      },
      req: request as any,
    })

    // 6. Retornar sucesso
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token: token.token,
    })
  } catch (error) {
    console.error('Exchange error:', error)
    return NextResponse.json(
      {
        error: 'Failed to exchange token',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
