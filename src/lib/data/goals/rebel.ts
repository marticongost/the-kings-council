import type { GoalData } from '#lib/models/cards';

export default {
	title: 'Rebel',
	goalType: 'collective',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'uprisingInOwnKingdom',
			effects: 'Afegeix una marca {input tally 3}.'
		},
		{
			type: 'reaction',
			trigger: 'gameEnd',
			effects: 'Guanya 3/4/5 {prestige} segons el número de marques que hagis col·locat.'
		}
	]
} satisfies GoalData;
