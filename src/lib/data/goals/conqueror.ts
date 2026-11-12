import type { GoalData } from '#lib/models/cards';

export default {
	title: 'Conqueridor',
	goalType: 'personal',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'afterResolvingAggression',
			effects: `Si has estat l'instigador de l'agressió i has guanyat un duel de {strength}, afegeix una marca {input tally 3}.`
		},
		{
			type: 'reaction',
			trigger: 'gameEnd',
			effects: 'Guanya 1/3/5 {prestige} segons les marques que hagis col·locat.'
		}
	]
} satisfies GoalData;
