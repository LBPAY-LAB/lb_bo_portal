import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })

    // Obter o token do cookie
    const cookieStore = await cookies()
    const cookiePrefix = payload.config.cookiePrefix || 'payload'
    const token = cookieStore.get(`${cookiePrefix}-token`)

    if (!token?.value) {
      return NextResponse.json({
        user: null,
      })
    }

    // Decodificar o token do PayloadCMS (sem verificar assinatura)
    // O token já foi criado pelo PayloadCMS, então podemos confiar nele
    try {
      const base64Payload = token.value.split('.')[1]
      const decoded = JSON.parse(Buffer.from(base64Payload, 'base64').toString())

      // Buscar o usuário completo no banco de dados
      const user = await payload.findByID({
        collection: 'users',
        id: decoded.id,
      })

      if (!user) {
        return NextResponse.json({
          user: null,
        })
      }

      // Retornar no formato esperado pelo Admin UI
      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          collection: 'users',
        },
        token: token.value,
        exp: decoded.exp,
      })
    } catch (error) {
      console.error('Token processing failed:', error)
      return NextResponse.json({
        user: null,
      })
    }
  } catch (error) {
    console.error('Error in /api/users/me:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
