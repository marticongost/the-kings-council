import type { GoalData } from '#lib/models/cards';

export default {
	title: 'Independent',
	goalType: 'collective',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'turnEnd',
			effects: 'Si no formes part de cap reialme, afegeix una marca {input tally 3,2,2,1,1}.'
		},
		{
			type: 'reaction',
			trigger: 'gameEnd',
			effects: 'Guanya {prestige 1} per cada grup complet que hagis emplenat.'
		}
	]
} satisfies GoalData;
