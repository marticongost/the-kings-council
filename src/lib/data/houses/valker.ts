import type { HouseData } from '#lib/models/cards';

export default {
	title: 'Casa Valker',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'gameStart',
			effects: 'Guanyar {power 2}.'
		}
	]
} satisfies HouseData;
