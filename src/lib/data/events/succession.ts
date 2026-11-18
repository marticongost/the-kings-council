import type { EventData } from '#lib/models/cards';

export default {
	title: 'Disputa dinàstica',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'turnEnd',
			effects: 'Resoldre una {succession-struggle}.'
		}
	]
} satisfies EventData;
