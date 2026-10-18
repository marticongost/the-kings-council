import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { optimize } from 'svgo';
import { defineConfig, type Plugin } from 'vite';

const optimizeSvg: Plugin = {
	name: 'optimize-inline-svg',
	enforce: 'pre',
	transform(src, id) {
		if (!id.endsWith('.svg')) return;

		const result = optimize(src, { multipass: true });

		return { code: result.data, map: null };
	}
};

export default defineConfig({
	plugins: [
		optimizeSvg,
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			// Static adapter: every page is prerendered, so the output in `build/`
			// can be served directly by nginx without a Node process.
			adapter: adapter({
				pages: 'build',
				assets: 'build',
				fallback: undefined,
				strict: true
			})
		})
	]
});
