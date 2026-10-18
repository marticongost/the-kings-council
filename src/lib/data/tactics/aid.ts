import { type TacticData } from '#lib/models/cards';

export default {
	title: 'Ajuda',
	discardBonus: { intrigue: 1 },
	capabilities: [
		{
			type: 'reaction',
			trigger: 'afterDuelDeclared',
			effects:
				'Si ets el {king}, pots pagar {power 1} per cancel·lar el duel. Si no, els demés {players} poden donar-te qualsevol quantitat dels seus recursos.'
		}
	]
} satisfies TacticData;
