import type { CrisisData } from '#lib/models/cards';

export default {
	title: 'Xantatge',
	test: '{gold} + {intrigue}',
	highestContributionReward: 'Guanya ½ de la contribució total a la crisi (arrodonint cap a baix).',
	fortuneEffects: {
		text: '{danger 2}',
		compute: () => 2
	},
	penalty:
		'El regne pateix {stability -1}. El membre del regne amb més {prestige} revela els seus {assets} {hidden} als {kingdom-members}, i perd {prestige 1} per cada {asset} {hidden} amb les propietats {illicit} o {magic}.'
} satisfies CrisisData;
