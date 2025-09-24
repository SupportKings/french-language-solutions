import { defineConfig } from 'tsdown'

export default defineConfig({
	entry: ['src/index.ts'],
	format: 'esm',
	platform: 'node',
	target: 'node18',
	clean: true,
	outdir: 'dist',
	external: [
		'@hono/trpc-server',
		'@hono/zod-validator',
		'@supabase/supabase-js',
		'@trpc/client',
		'@trpc/server',
		'date-fns',
		'dotenv',
		'drizzle-orm',
		'hono',
		'pg',
		'zod'
	]
})