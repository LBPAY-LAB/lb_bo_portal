import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: {
    // Usando autenticação local do Payload
    // Usuários do Keycloak serão sincronizados como shadow users
  },
  access: {
    // Permite que todos os usuários autenticados acessem o admin
    admin: ({ req: { user } }) => {
      return !!user
    },
  },
  endpoints: [
    {
      path: '/me',
      method: 'get',
      handler: async (req) => {
        const { user, payload } = req

        // Se não há usuário autenticado, retornar null
        if (!user) {
          return Response.json({
            user: null,
          })
        }

        // Pegar o token do cookie
        const cookiePrefix = payload.config.cookiePrefix || 'payload'
        const tokenCookie = req.cookies.get(`${cookiePrefix}-token`)

        let token = tokenCookie
        let exp = null

        // Se há token no cookie, decodificar para pegar a expiração
        if (token) {
          try {
            const decoded = jwt.decode(token) as any
            exp = decoded?.exp
          } catch (error) {
            console.error('Error decoding token:', error)
          }
        } else {
          // Se não há token no cookie, gerar um novo
          token = jwt.sign(
            {
              id: user.id,
              collection: 'users',
              email: user.email,
            },
            process.env.PAYLOAD_SECRET!,
            {
              expiresIn: '7d',
            },
          )

          // Decodificar para pegar a expiração
          const decoded = jwt.decode(token) as any
          exp = decoded?.exp
        }

        // Retornar o formato esperado pelo Admin UI
        return Response.json({
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            collection: 'users',
          },
          token,
          exp,
        })
      },
    },
  ],
  fields: [
    {
      name: 'email',
      type: 'email',
      required: false,
      admin: {
        description: 'Email from Keycloak',
      },
    },
    {
      name: 'name',
      type: 'text',
      required: false,
      admin: {
        description: 'Full name from Keycloak',
      },
    },
    {
      name: 'keycloak_sub',
      type: 'text',
      unique: true,
      required: false,
      admin: {
        description: 'Keycloak user ID (sub claim) for shadow user sync',
        readOnly: true,
      },
      index: true,
    },
    {
      name: 'roles',
      type: 'relationship',
      relationTo: 'roles',
      hasMany: true,
      admin: {
        description: 'User roles for RBAC',
      },
    },
  ],
}
