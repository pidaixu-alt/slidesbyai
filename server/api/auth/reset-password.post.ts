export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => null)
  const email = String(body?.email || '').trim().toLowerCase()
  if (!email || !email.includes('@')) {
    throw createError({ statusCode: 400, message: 'Enter a valid email.' })
  }

  const url = process.env.SUPABASE_URL?.replace(/\/$/, '')
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anon = process.env.SUPABASE_ANON_KEY || serviceKey
  if (!url || !serviceKey) {
    throw createError({ statusCode: 500, message: 'Auth is not configured.' })
  }

  const adminHeaders = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
  }

  let found = false
  for (let page = 1; page <= 20 && !found; page++) {
    const listed: any = await $fetch(`${url}/auth/v1/admin/users`, {
      query: { page: String(page), per_page: '200' },
      headers: adminHeaders,
    })
    const users = listed?.users || []
    found = users.some((u: any) => String(u.email || '').toLowerCase() === email)
    if (users.length < 200) break
  }

  if (!found) {
    throw createError({
      statusCode: 404,
      message: 'No Tagtery account uses this email. Create an account first, then you can reset the password.',
    })
  }

  try {
    await $fetch(`${url}/auth/v1/recover`, {
      method: 'POST',
      query: { redirect_to: 'https://www.tagtery.com/reset-password' },
      headers: {
        apikey: anon,
        Authorization: `Bearer ${anon}`,
        'Content-Type': 'application/json',
      },
      body: { email },
    })
  } catch (err: any) {
    const msg = String(err?.data?.message || err?.message || '')
    if (msg.toLowerCase().includes('rate')) {
      throw createError({ statusCode: 429, message: 'Too many reset emails. Please wait a minute and try again.' })
    }
    throw createError({ statusCode: 502, message: 'Could not send the reset email. Please try again in a minute.' })
  }

  return { ok: true }
})
