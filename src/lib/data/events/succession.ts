import type { EventData } from '#lib/models/cards';

export default {
	title: 'Successió',
	properties: ['adversity'],
	capabilities: [
		{
			type: 'reaction',
			trigger: 'turnEnd',
			effects:
				'{duel} {power} + {intrigue} + {strength} entre tots els membres del regne. Si el vencedor no és el {king}, el vencedor renúncia als seus càrrecs actuals i esdevé el nou {king} del regne. Descartar aquesta carta.'
		}
	]
} satisfies EventData;
