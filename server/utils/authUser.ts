export type AuthUser = { id: string; email: string }

export async function getRequestUser(event: any): Promise<AuthUser | null> {
  const header = getHeader(event, 'authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : ''
  const url = process.env.SUPABASE_URL?.replace(/\/$/, '')
  const anon = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!token || !url || !anon) return null
  try {
    const user: any = await $fetch(`${url}/auth/v1/user`, {
      headers: {
        apikey: anon,
        Authorization: `Bearer ${token}`,
      },
    })
    const email = String(user?.email || '').trim()
    const id = String(user?.id || '').trim()
    if (!email || !id) return null
    return { id, email }
  } catch {
    return null
  }
}

export async function requireUser(event: any): Promise<AuthUser> {
  const user = await getRequestUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Please log in or create an account first.' })
  }
  return user
}
