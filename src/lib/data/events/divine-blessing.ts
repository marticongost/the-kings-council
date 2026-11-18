import type { EventData } from '#lib/models/cards';

export default {
	title: 'Benedicció divina',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'whenRevealed',
			effects: 'El regne guanya {grace 1}.'
		}
	]
} satisfies EventData;
