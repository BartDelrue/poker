// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxt/test-utils', '@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  imports: {
    dirs: ['shared/**/*.ts', 'server/lib/*.ts']
  },
  nitro: {
    experimental: {
      websocket: true
    }
  }
})