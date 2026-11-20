import type { CrisisData } from '#lib/models/cards';

export default {
	title: 'Rebel·lió',
	test: '{strength}',
	challenge: {
		text: '4 - {stability} (mínim 1)',
		compute: (_state, kingdom) => Math.max(1, 4 - kingdom.stats.stability)
	},
	highestContributionReward: '{prestige 1}',
	penalty:
		'{stability -2}. Els {kingdom-members} que menys hagin contribuit perden una {tactic} aleatòria.'
} satisfies CrisisData;
