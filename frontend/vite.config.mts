import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// @ts-ignore
import eslint from 'vite-plugin-eslint'
import madge from 'madge'
// @ts-ignore
import path from 'path'
import checker from 'vite-plugin-checker'
// import { createRequire } from 'node:module';
// const require = createRequire( import.meta.url );
import fs from 'fs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    eslint(),
    checker({
      typescript: true
    }),

    {
      name: 'circular-dependency-watcher',
      async handleHotUpdate({ file, read, server }) {
        setTimeout(function() {
          madge(file, {
            webpackConfig: './madge-resolver-config.js'
          }).then((res) => {
            const circular = res.circular()
            if (circular.length > 0) {
              console.log('\x1b[31mCircular dependency warning!(HMR will not work properly!)\x1b[0m')
              console.log(circular)
              console.log('\x1b[31mCircular dependency warning!(HMR will not work properly!)\n' +
                                'For more info visit: https://github.com/pahen/madge' +
                                '\x1b[0m')
            }
          })
        }, 500)
      }
    }
  ],
  server: {
    strictPort: true,
    port: 8080,
    host: true,
    watch: {
      usePolling: true,
    },
    https: {
      key: fs.readFileSync(path.resolve(__dirname, '../certs/localhost/localhost.key')),
      cert: fs.readFileSync(path.resolve(__dirname, '../certs/localhost/localhost.crt')),
    }
  },
  resolve: {
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
    alias: {
      '@': path.resolve(__dirname, './src')
    },
  },
})
