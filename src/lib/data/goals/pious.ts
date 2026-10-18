import type { GoalData } from '#lib/models/cards';

export default {
	title: 'Piadós',
	goalType: 'personal',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'gameEnd',
			effects: 'Si acabes la partida amb 5 o més {faith} a la bossa, guanya {prestige 3}.'
		}
	]
} satisfies GoalData;
