import type { GoalData } from '#lib/models/cards';

export default {
	title: 'Acumulador',
	goalType: 'personal',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'gameEnd',
			effects: 'Guanya 2/3/4 {prestige} si acabes la partida amb 6-8/9-11/12+ {any}.'
		}
	]
} satisfies GoalData;
