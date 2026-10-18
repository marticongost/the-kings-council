import type { CrisisData } from '#lib/models/cards';

export default {
	title: 'Conspiració estrangera',
	properties: ['adversity'],
	test: '{intrigue}',
	difficulty: '{kingdom-members} × {danger}',
	highestContributionReward: '{prestige 1}',
	penalty:
		"El regne pateix -1 al seu {kingdom-stat} més baix (en cas d'empat el {king} decideix entre els indicadors més baixos). Els jugadors que menys hagin contribuit perden {power}={danger}."
} satisfies CrisisData;
