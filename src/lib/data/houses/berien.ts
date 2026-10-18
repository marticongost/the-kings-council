import type { HouseData } from '#lib/models/cards';

export default {
	title: 'Casa Berien',
	capabilities: [
		{
			type: 'action',
			title: 'A qualsevol cost',
			cost: { strength: 1 },
			effects: 'Guanya {intrigue 1}.'
		}
	]
} satisfies HouseData;
