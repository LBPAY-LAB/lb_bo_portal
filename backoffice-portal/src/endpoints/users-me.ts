// src/endpoints/users-me.ts
import type { Endpoint } from 'payload'
import jwt from 'jsonwebtoken'

export const usersMeEndpoint: Endpoint = {
  path: '/users/me',
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
}
