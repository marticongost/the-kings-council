import type { EventData } from '#lib/models/cards';

export default {
	title: 'Collita abundant',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'turnStart',
			effects: 'El regne guanya {stability 1}. Descartar aquesta carta.'
		}
	]
} satisfies EventData;
