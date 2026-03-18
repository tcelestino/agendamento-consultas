import { fileURLToPath, URL } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'

export default mergeConfig(
  {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  },
  defineConfig({
    test: {
      exclude: [...configDefaults.exclude, 'src/models', 'src/middlewares', 'src/routes'],
      environment: 'node',
      root: fileURLToPath(new URL('./__tests__', import.meta.url)),
      setupFiles: ['./setup.ts'],
    },
  }),
)
