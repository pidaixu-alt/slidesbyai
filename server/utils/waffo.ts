import { WaffoPancake, WaffoPancakeError } from '@waffo/pancake-ts'

export const WAFFO_STORE_ID = process.env.WAFFO_STORE_ID || 'STO_0eHrIhkCeELsInIIlKGPmo'

export const WAFFO_PRODUCTS = {
  monthly: { id: 'PROD_3vO5tmtdpI5rVLgeMnINVx', productType: 'subscription' as const },
  quarterly: { id: 'PROD_6mF7j0m59LfLzl5gYvSj10', productType: 'subscription' as const },
  annual: { id: 'PROD_4iYdAD907eAqIhIXCx4p1A', productType: 'subscription' as const },
}

export function getWaffoClient() {
  const merchantId = process.env.WAFFO_MERCHANT_ID
  const privateKey = process.env.WAFFO_PRIVATE_KEY?.replace(/\\n/g, '\n')
  if (!merchantId || !privateKey) {
    throw createError({ statusCode: 500, message: 'Waffo payments are not configured.' })
  }
  return new WaffoPancake({
    merchantId,
    privateKey,
    environment: (process.env.WAFFO_ENV || 'prod') as 'prod' | 'test',
  })
}

export function waffoErrorMessage(err: unknown) {
  if (err instanceof WaffoPancakeError) {
    return err.errors?.[0]?.message || err.message || 'Checkout failed.'
  }
  return err instanceof Error ? err.message : 'Checkout failed.'
}
