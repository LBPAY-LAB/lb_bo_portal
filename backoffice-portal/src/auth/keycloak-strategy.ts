// src/auth/keycloak-strategy.ts
import type { PayloadRequest, User } from 'payload'

export const keycloakStrategy = {
  name: 'keycloak',
  authenticate: async ({ payload, headers }: { payload: any; headers: Headers }) => {
    const authHeader = headers.get('authorization') || headers.get('Authorization')

    if (!authHeader) {
      return { user: null }
    }

    const token = authHeader.replace(/^Bearer\s+/i, '')

    if (!token) {
      return { user: null }
    }

    try {
      // Decodificar o token JWT (sem validação de assinatura por enquanto)
      const base64Payload = token.split('.')[1]
      const decodedPayload = JSON.parse(Buffer.from(base64Payload, 'base64').toString())

      const { sub, email, preferred_username, given_name, family_name } = decodedPayload

      if (!sub) {
        console.error('Token JWT não contém o campo "sub"')
        return { user: null }
      }

      // Buscar usuário existente pelo keycloak_sub
      const existingUsers = await payload.find({
        collection: 'users',
        where: {
          keycloak_sub: {
            equals: sub,
          },
        },
        limit: 1,
      })

      let user: User

      if (existingUsers.docs.length > 0) {
        // Usuário existe
        const existingUser = existingUsers.docs[0] as User

        // Atualizar email e nome se não existirem
        if (!existingUser.email || !existingUser.name) {
          const name = given_name && family_name ? `${given_name} ${family_name}` : preferred_username

          const updatedUser = await payload.update({
            collection: 'users',
            id: existingUser.id,
            data: {
              email: email || `${preferred_username}@keycloak.local`,
              name: name || preferred_username,
            },
          })

          user = updatedUser as User
        } else {
          user = existingUser
        }
      } else {
        // Usuário não existe, criar (Just-in-Time Provisioning)
        const name = given_name && family_name ? `${given_name} ${family_name}` : preferred_username

        const newUser = await payload.create({
          collection: 'users',
          data: {
            email: email || `${preferred_username}@keycloak.local`,
            name: name || preferred_username,
            keycloak_sub: sub,
            password: Math.random().toString(36) + Math.random().toString(36), // Senha aleatória
          },
        })

        user = newUser as User
      }

      console.log('✅ Keycloak Strategy: User authenticated', {
        id: user.id,
        email: user.email,
        keycloak_sub: sub,
      })

      // Criar sessão para o usuário
      await payload.create({
        collection: 'users-sessions',
        data: {
          _parent: user.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      })

      return {
        user: {
          ...user,
          collection: 'users',
          _strategy: 'keycloak',
        },
      }
    } catch (error) {
      console.error('❌ Keycloak Strategy Error:', error)
      return { user: null }
    }
  },
}
