// Load all SVGs as raw text
const svgsRecord = import.meta.glob('/src/lib/assets/svg/**/*.svg', {
	query: '?raw',
	import: 'default',
	eager: true
});

/**
 * SVGs are rendered inline via {@html ...} in InlineSvg.svelte, so they all
 * share the same DOM. Any ids inside them (e.g. gradient ids like "a", "b",
 * "c" in the house icons) would collide: the first SVG to define a given id
 * wins, and every other SVG ends up referencing that first definition.
 *
 * Namespace every id definition and every `#...` reference with a prefix
 * derived from the file path so each SVG's ids stay unique.
 */
function makeIdNamespace(key: string): string {
	return key
		.replace(/\.svg$/, '')
		.replace(/[^a-zA-Z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

function namespaceSvgIds(raw: string, namespace: string): string {
	return raw
		.replace(/(?<![\w-])id=(["'])(.*?)\1/g, `id=$1${namespace}-$2$1`)
		.replace(/url\(\s*(["']?)#(.*?)\1\s*\)/g, `url($1#${namespace}-$2$1)`)
		.replace(/((?<![\w-])(?:xlink:)?href)=(["'])#(.*?)\2/g, `$1=$2#${namespace}-$3$2`);
}

export { makeIdNamespace, namespaceSvgIds };

// Export as a map with normalized keys
export const svgs = new Map<string, string>();
for (const [key, value] of Object.entries(svgsRecord)) {
	const normalizedKey = key.replace('/src/lib/assets/svg/', '');
	svgs.set(normalizedKey, namespaceSvgIds(value, makeIdNamespace(normalizedKey)));
}
