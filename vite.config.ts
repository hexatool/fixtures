import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
	build: {
		target: "ESNext",
		lib: {
			formats: ["es"],
			fileName: (format) => `hexatool-fixtures.${format === "es" ? "mjs" : "cjs"}`,
			entry: resolve(__dirname, 'src/index.ts'),
		},
		sourcemap: true,
		rollupOptions: {
			external: [
				"node:path",
				"fs-extra",
				"globby",
				"signal-exit",
				"tempy",
			],
			output: {
				exports: "named"
			}
		},
	},
});
