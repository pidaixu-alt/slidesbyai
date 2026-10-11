import { WaffoPancake, WaffoPancakeError } from '@waffo/pancake-ts'

export const WAFFO_STORE_ID = process.env.WAFFO_STORE_ID || 'STO_2oMdSreOcIpWJDGaH24P65'

/** Slides by AI subscription products (test store until prodEnabled). */
export const WAFFO_PRODUCTS = {
  monthly: {
    id: process.env.WAFFO_PRODUCT_MONTHLY || 'PROD_3rvOTAREa8jBI3Qc3ND4DG',
    productType: 'subscription' as const,
  },
  quarterly: {
    id: process.env.WAFFO_PRODUCT_QUARTERLY || 'PROD_5Ji0A6EyjWTgg0wxqoUEVK',
    productType: 'subscription' as const,
  },
  annual: {
    id: process.env.WAFFO_PRODUCT_ANNUAL || 'PROD_54LfTdRkukc5NRNqi7l8CA',
    productType: 'subscription' as const,
  },
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
    environment: (process.env.WAFFO_ENV || 'test') as 'prod' | 'test',
  })
}

export function waffoErrorMessage(err: unknown) {
  if (err instanceof WaffoPancakeError) {
    return err.errors?.[0]?.message || err.message || 'Checkout failed.'
  }
  return err instanceof Error ? err.message : 'Checkout failed.'
}
