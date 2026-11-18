import type { EventData } from '#lib/models/cards';

export default {
	title: 'Collita abundant',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'whenRevealed',
			effects: 'El regne guanya {wealth 1}.'
		}
	]
} satisfies EventData;
