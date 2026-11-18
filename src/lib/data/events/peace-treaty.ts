import type { EventData } from '#lib/models/cards';

export default {
	title: 'Tractat de pau',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'whenRevealed',
			effects: 'El regne guanya {stability 1}.'
		}
	]
} satisfies EventData;
