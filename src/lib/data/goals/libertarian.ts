import type { GoalData } from '#lib/models/cards';

export default {
	title: 'Llibertari',
	goalType: 'collective',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'gameEnd',
			effects: 'Si pertanys a un regne que tingui 2 o menys lleis en vigor, guanya {prestige 3}.'
		}
	]
} satisfies GoalData;
