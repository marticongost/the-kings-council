import type { AssetData } from '#lib/models/cards';

export default {
	title: 'Amant',
	properties: ['illicit', 'retinue'],
	hidden: true,
	capabilities: [
		{
			type: 'reaction',
			trigger: 'whenAcquired',
			effects: 'Escollir un {input player}.'
		},
		{
			title: 'Ocultar',
			type: 'secret',
			effects:
				'Resol un {plot} {input intrigue} contra el jugador designat. Si té èxit, roba-li {prestige 1} i marca la casella "Ocult".'
		},
		{
			type: 'reaction',
			trigger: 'turnEnd',
			effects: `Ocult: {input check}. Si la casella està marcada, esborra-la. Si no, {reveal} i {discard} aquest actiu.`
		}
	]
} satisfies AssetData;
