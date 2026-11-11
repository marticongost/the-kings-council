import type { GoalData } from '#lib/models/cards';

export default {
	title: 'Buròcrata',
	goalType: 'collective',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'gameEnd',
			effects: 'Guanya {prestige 1} per cada llei en vigor que el teu regne tingui (màxim 4).'
		}
	]
} satisfies GoalData;
