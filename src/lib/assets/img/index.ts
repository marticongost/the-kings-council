// Load all card artwork. Vite resolves each imported image to its URL so the
// component layer can tell whether artwork for a card exists without firing
// requests for missing files.
const imagesRecord = import.meta.glob('/src/lib/assets/img/cards/*.jpg', {
	import: 'default',
	eager: true
});

/** Card artwork keyed by `/cards/{id}.jpg`, matching the generated files. */
export const cardImages = new Map<string, string>();
for (const [key, value] of Object.entries(imagesRecord)) {
	cardImages.set(key.replace('/src/lib/assets/img', ''), value as string);
}

/** The URL of the generated artwork for a card, or `undefined` if it has none. */
export function getCardImage(cardId: string): string | undefined {
	return cardImages.get(`/cards/${cardId}.jpg`);
}
