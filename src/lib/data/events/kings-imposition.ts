import type { EventData } from '#lib/models/cards';

export default {
	title: 'Imposició reial',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'whenRevealed',
			effects:
				'Si no hi ha {king}, descartar la carta i robar-ne una altra. Si no, el {king} escull una de les lleis de la {laws-pool} i la posa en joc (sense {vote}). Robar una nova {law} i afegir-la a la {laws-pool}.'
		}
	]
} satisfies EventData;
