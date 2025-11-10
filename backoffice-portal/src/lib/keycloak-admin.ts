// Keycloak Admin Client for user management
import KcAdminClient from '@keycloak/keycloak-admin-client'

/**
 * Keycloak Admin Service
 *
 * Manages users, roles, and 2FA configuration in Keycloak
 * via Admin REST API.
 */
export class KeycloakAdminService {
  private client: KcAdminClient
  private realm: string

  constructor() {
    // Extract realm name from KEYCLOAK_ISSUER
    const issuer = process.env.KEYCLOAK_ISSUER || ''
    const realmMatch = issuer.match(/\/realms\/([^/]+)/)
    this.realm = realmMatch ? realmMatch[1] : 'lbpay-portal'

    // Initialize client with base URL (without /realms/...)
    const baseUrl = issuer.replace(/\/realms\/.*$/, '')

    this.client = new KcAdminClient({
      baseUrl,
      realmName: this.realm,
    })

    console.log('✅ Keycloak Admin Client initialized:', {
      baseUrl,
      realm: this.realm,
    })
  }

  /**
   * Authenticate admin client with client credentials
   */
  async authenticate(): Promise<void> {
    try {
      await this.client.auth({
        grantType: 'client_credentials',
        clientId: process.env.KEYCLOAK_CLIENT_ID || '',
        clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || '',
      })

      console.log('✅ Keycloak Admin Client authenticated')
    } catch (error) {
      console.error('❌ Failed to authenticate Keycloak Admin Client:', error)
      throw new Error('Failed to authenticate with Keycloak Admin API')
    }
  }

  /**
   * Create user in Keycloak
   *
   * @param data User data
   * @returns Keycloak user ID (sub)
   */
  async createUser(data: {
    email: string
    firstName: string
    lastName: string
    enabled?: boolean
    emailVerified?: boolean
    requiredActions?: string[]
  }): Promise<string> {
    await this.authenticate()

    try {
      const response = await this.client.users.create({
        realm: this.realm,
        username: data.email, // Use email as username
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        enabled: data.enabled ?? true,
        emailVerified: data.emailVerified ?? false,
        requiredActions: data.requiredActions || [],
      })

      // Get user ID from response headers (Location header)
      const userId = response.id

      if (!userId) {
        throw new Error('Failed to get user ID from Keycloak response')
      }

      console.log('✅ Keycloak user created:', {
        email: data.email,
        userId,
      })

      return userId
    } catch (error: any) {
      console.error('❌ Failed to create Keycloak user:', error)

      // Check if user already exists
      if (error.response?.status === 409) {
        throw new Error('User with this email already exists in Keycloak')
      }

      throw new Error(`Failed to create user in Keycloak: ${error.message}`)
    }
  }

  /**
   * Set temporary password for user
   * User will be forced to change password on first login
   *
   * @param userId Keycloak user ID
   * @param password Temporary password
   */
  async setTemporaryPassword(userId: string, password: string): Promise<void> {
    await this.authenticate()

    try {
      await this.client.users.resetPassword({
        realm: this.realm,
        id: userId,
        credential: {
          temporary: true,
          type: 'password',
          value: password,
        },
      })

      console.log('✅ Temporary password set for user:', userId)
    } catch (error: any) {
      console.error('❌ Failed to set temporary password:', error)
      throw new Error(`Failed to set password: ${error.message}`)
    }
  }

  /**
   * Set permanent password for user
   *
   * @param userId Keycloak user ID
   * @param password Password
   */
  async setPassword(userId: string, password: string): Promise<void> {
    await this.authenticate()

    try {
      await this.client.users.resetPassword({
        realm: this.realm,
        id: userId,
        credential: {
          temporary: false,
          type: 'password',
          value: password,
        },
      })

      console.log('✅ Password set for user:', userId)
    } catch (error: any) {
      console.error('❌ Failed to set password:', error)
      throw new Error(`Failed to set password: ${error.message}`)
    }
  }

  /**
   * Send password reset email via Keycloak
   *
   * @param userId Keycloak user ID
   * @param lifespanSeconds Link expiration in seconds (default: 12 hours)
   */
  async sendPasswordResetEmail(userId: string, lifespanSeconds = 43200): Promise<void> {
    await this.authenticate()

    try {
      await this.client.users.executeActionsEmail({
        realm: this.realm,
        id: userId,
        actions: ['UPDATE_PASSWORD'],
        lifespan: lifespanSeconds,
      })

      console.log('✅ Password reset email sent to user:', userId)
    } catch (error: any) {
      console.error('❌ Failed to send password reset email:', error)
      throw new Error(`Failed to send password reset email: ${error.message}`)
    }
  }

  /**
   * Check if user has 2FA (OTP) enabled
   *
   * @param userId Keycloak user ID
   * @returns True if 2FA is enabled
   */
  async getTwoFactorStatus(userId: string): Promise<boolean> {
    await this.authenticate()

    try {
      const credentials = await this.client.users.getCredentials({
        realm: this.realm,
        id: userId,
      })

      // Check if any credential is of type 'otp'
      const has2FA = credentials.some((cred) => cred.type === 'otp')

      console.log('✅ 2FA status for user:', { userId, has2FA })

      return has2FA
    } catch (error: any) {
      console.error('❌ Failed to get 2FA status:', error)
      // Return false if error (user may not exist or API error)
      return false
    }
  }

  /**
   * Assign realm role to user
   *
   * @param userId Keycloak user ID
   * @param roleName Role name (e.g., 'admin', 'operator')
   */
  async assignRole(userId: string, roleName: string): Promise<void> {
    await this.authenticate()

    try {
      // Get all realm roles
      const roles = await this.client.roles.find({
        realm: this.realm,
      })

      // Find role by name
      const role = roles.find((r) => r.name === roleName)

      if (!role || !role.id) {
        console.warn('⚠️ Role not found in Keycloak:', roleName)
        return
      }

      // Assign role to user
      await this.client.users.addRealmRoleMappings({
        realm: this.realm,
        id: userId,
        roles: [
          {
            id: role.id,
            name: role.name!,
          },
        ],
      })

      console.log('✅ Role assigned to user:', { userId, roleName })
    } catch (error: any) {
      console.error('❌ Failed to assign role:', error)
      throw new Error(`Failed to assign role: ${error.message}`)
    }
  }

  /**
   * Get user by email
   *
   * @param email User email
   * @returns Keycloak user or null if not found
   */
  async getUserByEmail(email: string): Promise<any | null> {
    await this.authenticate()

    try {
      const users = await this.client.users.find({
        realm: this.realm,
        email,
        exact: true,
      })

      if (users.length === 0) {
        return null
      }

      return users[0]
    } catch (error: any) {
      console.error('❌ Failed to get user by email:', error)
      return null
    }
  }

  /**
   * Update user in Keycloak
   *
   * @param userId Keycloak user ID
   * @param data User data to update
   */
  async updateUser(
    userId: string,
    data: {
      firstName?: string
      lastName?: string
      email?: string
      enabled?: boolean
      emailVerified?: boolean
    },
  ): Promise<void> {
    await this.authenticate()

    try {
      await this.client.users.update(
        {
          realm: this.realm,
          id: userId,
        },
        data,
      )

      console.log('✅ Keycloak user updated:', userId)
    } catch (error: any) {
      console.error('❌ Failed to update Keycloak user:', error)
      throw new Error(`Failed to update user: ${error.message}`)
    }
  }

  /**
   * Delete user from Keycloak
   *
   * @param userId Keycloak user ID
   */
  async deleteUser(userId: string): Promise<void> {
    await this.authenticate()

    try {
      await this.client.users.del({
        realm: this.realm,
        id: userId,
      })

      console.log('✅ Keycloak user deleted:', userId)
    } catch (error: any) {
      console.error('❌ Failed to delete Keycloak user:', error)
      throw new Error(`Failed to delete user: ${error.message}`)
    }
  }
}

// Lazy singleton instance
let _keycloakAdmin: KeycloakAdminService | null = null

export function getKeycloakAdmin(): KeycloakAdminService {
  if (!_keycloakAdmin) {
    _keycloakAdmin = new KeycloakAdminService()
  }
  return _keycloakAdmin
}

// For backward compatibility
export const keycloakAdmin = getKeycloakAdmin()
