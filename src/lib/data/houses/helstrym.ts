import type { HouseData } from '#lib/models/cards';

export default {
	title: 'Casa Helstrym',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'gameStart',
			effects: 'Guanyar {strength 2}.'
		}
	]
} satisfies HouseData;
