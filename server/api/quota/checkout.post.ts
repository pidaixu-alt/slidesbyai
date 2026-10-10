import { WaffoPancakeError } from '@waffo/pancake-ts'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody(event).catch(() => null)
  const raw = String(body?.plan || '')
  const normalized = raw === 'halfYear' || raw === 'halfyear' ? 'quarterly' : raw
  const plan = normalized as keyof typeof WAFFO_PRODUCTS
  const product = WAFFO_PRODUCTS[plan]
  if (!product) {
    throw createError({ statusCode: 400, message: 'Unknown plan.' })
  }

  const ipHash = getIpHash(event)
  await createCheckoutIntent(ipHash, plan, user.email)

  try {
    const client = getWaffoClient()
    const session = await client.checkout.authenticated.create({
      productId: product.id,
      currency: 'USD',
      buyerIdentity: user.id,
      buyerEmail: user.email,
      successUrl: 'https://www.slidesbyai.com/',
      metadata: {
        plan,
        email: user.email,
        userId: user.id,
      },
    })
    if (!session?.checkoutUrl) {
      throw createError({ statusCode: 502, message: 'Checkout session did not return a URL.' })
    }
    return { url: session.checkoutUrl, sessionId: session.sessionId }
  } catch (err: any) {
    const status = err instanceof WaffoPancakeError ? err.status || 502 : err?.statusCode || 502
    throw createError({
      statusCode: status >= 400 && status < 600 ? status : 502,
      message: waffoErrorMessage(err),
    })
  }
})
