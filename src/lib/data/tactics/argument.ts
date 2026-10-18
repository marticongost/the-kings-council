import { type TacticData } from '#lib/models/cards';

export default {
	title: 'Argumentació',
	discardBonus: { power: 1 },
	properties: [],
	capabilities: [
		{
			type: 'reaction',
			trigger: 'voting',
			effects:
				'Si ets el {king}, pots vetar la {vote} en curs: la {vote} finalitza en fracàs i la llei proposada es descarta. Si no, guanya +2 vots.'
		}
	]
} satisfies TacticData;
