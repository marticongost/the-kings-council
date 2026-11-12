import type { GoalData } from '#lib/models/cards';

export default {
	title: 'Heroic',
	goalType: 'personal',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'afterResolvingAggression',
			effects: `Si has estat el major contribuent (o empatat al capdavant), afegeix una marca {input tally 5}.`
		},
		{
			type: 'reaction',
			trigger: 'gameEnd',
			effects: 'Guanya {prestige 1} per cada marca que hagis col·locat.'
		}
	]
} satisfies GoalData;
