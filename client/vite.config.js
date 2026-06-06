import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // Use jsdom to simulate a browser environment
    environment: 'jsdom',
    // Make describe/it/expect available globally without importing
    globals: true,
    // Run setup file before each test file
    setupFiles: ['./src/test/setup.js'],
    // Include all test files
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    // Coverage config
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        'dist/',
        '*.config.*',
      ],
    },
  },
})

