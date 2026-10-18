import type { GoalData } from '#lib/models/cards';

export default {
	title: 'Creient',
	goalType: 'collective',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'gameEnd',
			effects: 'Si la {grace} del teu regne és 4 o més, guanya {prestige 3}.'
		}
	]
} satisfies GoalData;
