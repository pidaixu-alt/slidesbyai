export default defineNuxtPlugin(async () => {
  const { init, ready } = useAuth()
  try {
    await init()
  } catch {
    ready.value = true
  }
})
