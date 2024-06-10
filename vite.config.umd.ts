import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

const packageName = 'imgLabel';
const packageDir = './src';
const entry = resolve(__dirname, './src/index.ts');
// const outDir = resolve(__dirname, './dist');
const outDir = resolve(__dirname);

export default defineConfig({
  mode: 'production',
  build: {
    // target: 'modules',
    minify: true,
    // cssMinify:true,
    outDir: resolve(outDir, './umd'),
    emptyOutDir: false,
    lib: {
      formats: ['umd'],
      entry: entry,
      name: packageName,
    },
  },
});
