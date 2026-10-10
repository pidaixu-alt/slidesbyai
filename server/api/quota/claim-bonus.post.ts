export default defineEventHandler(async (event) => {
  const ipHash = getIpHash(event)
  const res = await claimSignupBonus(ipHash)
  const state = await getQuotaState(ipHash)
  return {
    ...res,
    remaining: state.remaining,
    plan: state.row.plan,
    paid: state.paid,
  }
})
