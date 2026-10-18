import type { GoalData } from '#lib/models/cards';

export default {
	title: 'Acumulador',
	goalType: 'personal',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'gameEnd',
			effects: 'Si acabes la partida amb 8 o més cartes a la mà, guanya {prestige 3}.'
		}
	]
} satisfies GoalData;
