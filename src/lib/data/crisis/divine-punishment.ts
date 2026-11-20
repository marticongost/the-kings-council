import type { CrisisData } from '#lib/models/cards';
import type { KingdomState } from '../../../routes/simulator/types';

export default {
	title: 'Càstig diví',
	test: '{faith}',
	highestContributionReward: '{prestige 1}, {asset} {holy} aleatori',
	challenge: {
		text: '5 - {grace}',
		compute: (_state, kingdom: KingdomState) => 5 - kingdom.stats.grace
	},
	penalty:
		'El regne redueix en 1 tots els seus {kingdom-stats}. Els jugadors que menys hagin contribuit perden tots els seus actius {magic} o {illicit}.'
} satisfies CrisisData;
