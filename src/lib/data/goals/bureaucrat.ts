import type { GoalData } from '#lib/models/cards';

export default {
	title: 'Buròcrata',
	goalType: 'collective',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'gameEnd',
			effects: 'Si el teu regne té 5+ lleis en vigor, guanya {prestige 3}.'
		}
	]
} satisfies GoalData;
