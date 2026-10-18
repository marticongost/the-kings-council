import { type TacticData } from '#lib/models/cards';

export default {
	title: 'Sabotatge',
	discardBonus: { intrigue: 1 },
	properties: ['machination'],
	capabilities: [
		{
			title: 'Un lamentable accident...',
			type: 'secret',
			effects:
				'Resol un {plot} {input intrigue} contra {input player}; si té èxit, {disable} un dels seus {assets} {visible}.'
		}
	]
} satisfies TacticData;
