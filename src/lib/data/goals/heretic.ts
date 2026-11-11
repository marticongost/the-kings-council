import type { GoalData } from '#lib/models/cards';
import { lowKingdomStatGoalReaction } from '../reusable-definitions';

export default {
	title: 'Heretge',
	goalType: 'collective',
	capabilities: [lowKingdomStatGoalReaction('grace')]
} satisfies GoalData;
