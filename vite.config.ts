import { resolve } from 'node:path';

import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { externalizeDeps } from 'vite-plugin-externalize-deps';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
	build: {
		target: 'ESNext',
		lib: {
			formats: ['es'],
			fileName: format => `hexatool-fixtures.${format === 'es' ? 'mjs' : 'cjs'}`,
			entry: resolve(__dirname, 'src/index.ts'),
		},
		minify: false,
		sourcemap: false,
	},
	plugins: [dts(), externalizeDeps(), tsconfigPaths()],
});
