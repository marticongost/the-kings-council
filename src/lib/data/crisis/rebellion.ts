import type { CrisisData } from '#lib/models/cards';

export default {
	title: 'Rebel·lió',
	properties: ['adversity'],
	test: '{strength}',
	difficulty: '{kingdom-members} × {danger} - {stability}',
	highestContributionReward: '{prestige 1}',
	penalty:
		'{stability -2}. Els {kingdom-members} que menys hagin contribuit perden una {tactic} aleatòria.'
} satisfies CrisisData;
