import type { GoalData } from '#lib/models/cards';

export default {
	title: 'Heretge',
	goalType: 'collective',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'gameEnd',
			effects: 'Si la {grace} del teu regne és 2 o menys, guanya {prestige 4}.'
		}
	]
} satisfies GoalData;
