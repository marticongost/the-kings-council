import type { EventData } from '#lib/models/cards';

export default {
	title: 'Èxits militars',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'whenRevealed',
			effects: 'El regne guanya {might 1}.'
		}
	]
} satisfies EventData;
