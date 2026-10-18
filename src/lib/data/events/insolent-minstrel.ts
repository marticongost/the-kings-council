import type { EventData } from '#lib/models/cards';

export default {
	title: 'Joglar insolent',
	properties: ['adversity'],
	capabilities: [
		{
			type: 'reaction',
			trigger: 'whenRevealed',
			effects:
				'Si no hi ha {king}, descartar la carta i robar-ne una altra. Si no, el {king} escull entre perdre {prestige 1} o (si no pot, o no vol) causar {stability -1} al regne. Descartar aquesta carta.'
		}
	]
} satisfies EventData;
