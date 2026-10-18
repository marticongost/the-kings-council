import type { LawData } from '#lib/models/cards';

export default {
	title: 'Llei de promeses vinculants',
	capabilities: [
		{
			title: 'Promeses vinculants',
			type: 'constant',
			effects:
				"Les promeses fetes durant un intercanvi són vinculants. Si no es poden satisfer en el termini acordat, l'infractor perd {prestige 1}."
		}
	]
} satisfies LawData;
