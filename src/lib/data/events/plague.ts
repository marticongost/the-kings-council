import type { EventData } from '#lib/models/cards';

export default {
	title: 'Plaga',
	properties: ['adversity'],
	capabilities: [
		{
			type: 'reaction',
			trigger: 'turnEnd',
			effects:
				"El regne pateix {stability -2}. Llançar 1d6 per cada {kingdom-member}. Amb un resultat d'1 o 2, escollir una de les seves cartes {retinue} aleatòria i descartar-la. A continuació, descartar aquesta carta."
		}
	]
} satisfies EventData;
