import type { AssetData } from '#lib/models/cards';

export default {
	title: 'Fill bastard',
	properties: ['retinue'],
	hidden: true,
	capabilities: [
		{
			title: 'Ocultar',
			type: 'secret',
			effects:
				'Resol un {plot} {input intrigue} contra el regne. Si té èxit, guanya {prestige 1} i marca la casella "Ocult".'
		},
		{
			type: 'reaction',
			trigger: 'turnEnd',
			effects: `Ocult: {input check}. Si la casella està marcada, esborra-la. Si no, {discard} aquest actiu.`
		}
	]
} satisfies AssetData;
