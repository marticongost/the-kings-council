// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		interface PageData {
			/** Renders the page across the whole viewport width instead of the document width. */
			fullBleed?: boolean;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
