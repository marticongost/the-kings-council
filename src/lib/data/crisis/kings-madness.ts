import type { CrisisData } from '#lib/models/cards';

export default {
	title: 'La bogeria del rei',
	test: '{intrigue}',
	fortuneEffects: {
		text: '{kingdom-members} - 1',
		compute: (state, kingdom) => Math.max(0, state.membersOf(kingdom.id).length - 1)
	},
	highestContributionReward: '{prestige 1}, inicia una {succession-struggle}',
	penalty:
		'Els {kingdom-stats} intercanvien el seu valor amb el següent indicador. Els subdits passen les seves {tactics} i {offices} al següent subdit (en sentit horari).',
	capabilities: [
		{
			type: 'reaction',
			trigger: 'whenRevealed',
			effects: 'Si no hi ha {king}, descartar la carta i robar-ne una altra.'
		}
	]
} satisfies CrisisData;
