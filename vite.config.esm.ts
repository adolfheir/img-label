import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

const packageName = 'img-label';
const packageDir = './src';
const entry = resolve(__dirname, './src/index.ts');
// const outDir = resolve(__dirname, 'dist');
const outDir = resolve(__dirname);

export default defineConfig({
  mode: 'production',
  build: {
    target: 'modules',
    minify: false,
    cssMinify: true,
    outDir: outDir,
    emptyOutDir: false,
    cssCodeSplit: false,
    lib: {
      formats: ['es'],
      entry: entry,
    },
    rollupOptions: {
      external: (id: string, importer) => {
        // Ensures no deps are bundled with build.
        // Source paths are expected to start with `./` or `/` or `../`  but may be `x:` on Windows.
        let isMatch = !id.match(/^((\w:)|(.?[\/])|(\.{2}[\/]))/);
        return isMatch;
      },
      input: [resolve(__dirname, 'src/index.ts')],
      preserveEntrySignatures: 'strict',
      output: [
        {
          format: 'es',
          entryFileNames: ({ name }) => `${name}.js`,
          dir: resolve(outDir, 'es'),
          preserveModules: true,
          preserveModulesRoot: packageDir,
          sourcemap: true,
        },
      ],
    },
  },
  plugins: [
    dts({
      outDir: resolve(outDir, 'es'), //和es 一个目录
      insertTypesEntry: true,
      include: [packageDir],
      entryRoot: packageDir,
    }),
  ],
});
