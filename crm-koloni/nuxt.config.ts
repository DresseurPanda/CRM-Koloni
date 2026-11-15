export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
    '@nuxt/eslint',
    'nuxt-auth-utils'
  ],

  devtools: {
    enabled: true
  },

  app: {
    head: {
      title: 'CRM Koloni',
      htmlAttrs: {
        lang: 'fr'
      },
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }
      ],
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ],
      noscript: [
        { textContent: 'JavaScript is required' }
      ]
    }
  },

  css: ['~/assets/css/main.css'],

  colorMode: {
    preference: 'system',
    fallback: 'dark',
    classSuffix: ''
  },

  ui: {
    theme: {
      transitions: true,
      defaultVariants: {
        color: 'primary',
        size: 'md'
      },
      colors: [
        'primary', 'secondary', 'info', 'success', 'warning', 'error',
        'violet', 'pink', 'orange', 'teal', 'cyan', 'rose', 'indigo', 'lime', 'fuchsia', 'purple'
      ]
    },
    experimental: {
      componentDetection: true
    }
  },

  runtimeConfig: {
    // Connexion PostgreSQL, surchargée par NUXT_DATABASE_HOST, NUXT_DATABASE_PORT, etc.
    database: {
      host: 'localhost',
      port: '5432',
      name: 'koloni',
      user: 'koloni_app',
      password: ''
    },
    // Cookie de session de nuxt-auth-utils, chiffré avec une clé dérivée de NUXT_APP_SECRET
    session: {
      cookie: {
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },

  compatibilityDate: '2025-01-15',

  vite: {
    // Dépendances pré-compilées dès le démarrage : sinon Vite les découvre au premier chargement
    // d'une page qui les utilise (zod sur la connexion, les devtools) et recharge la page
    optimizeDeps: {
      include: ['zod', '@vue/devtools-core']
    }
  },

  typescript: {
    tsConfig: {
      compilerOptions: {
        types: ['node']
      }
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
