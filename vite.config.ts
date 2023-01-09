import { resolve } from 'node:path';
import { defineConfig } from 'vite';

import typescript2 from 'rollup-plugin-typescript2';

export default defineConfig({
	build: {
		target: "ESNext",
		lib: {
			formats: ["es"],
			fileName: (format) => `hexatool-fixtures.${format === "es" ? "mjs" : "cjs"}`,
			entry: resolve(__dirname, 'src/index.ts'),
		},
		minify: true,
		sourcemap: false,
		rollupOptions: {
			external: [
				'node:fs',
				'node:path',
				'@hexatool/fs-copy',
				'@hexatool/fs-remove',
				'@hexatool/fs-temporary',
				'fdir',
				'signal-exit',
			],
			output: {
				exports: "named"
			}
		},
	},

	plugins: [
		{
			...typescript2({
				check: false,
				tsconfigOverride: {
					compilerOptions: {
						module: 'ES2020',
						declaration: true,
						declarationDir: 'dist/types',
						emitDeclarationOnly: true,
						baseUrl: '.',
					},
				},
				include: ['src/*.ts+(|x)', 'src/**/*.ts+(|x)'],
				useTsconfigDeclarationDir: true,
			}),
			apply: 'build',
		},
	],
});
