import type { GoalData } from '#lib/models/cards';

export default {
	title: 'Conqueridor',
	goalType: 'personal',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'gameEnd',
			effects:
				'Si ets el jugador amb més victòries totals, guanya {prestige 1} per cada 3 jugadors presents a la partida (arrodonint avall).'
		}
	]
} satisfies GoalData;
