import type { GoalData } from '#lib/models/cards';

export default {
	title: 'Avariciós',
	goalType: 'personal',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'gameEnd',
			effects: 'Si acabes la partida amb 5 o més {gold} a la bossa, guanya {prestige 3}.'
		}
	]
} satisfies GoalData;
