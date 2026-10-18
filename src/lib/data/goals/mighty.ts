import type { GoalData } from '#lib/models/cards';

export default {
	title: 'Poderós',
	goalType: 'personal',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'gameEnd',
			effects:
				'Si ets el jugador amb més {strength} a la bossa, guanya {prestige 1} per cada 3 jugadors presents a la partida (arrodonint avall).'
		}
	]
} satisfies GoalData;
