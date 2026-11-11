import type { GoalData } from '#lib/models/cards';
import { lowKingdomStatGoalReaction } from '../reusable-definitions';

export default {
	title: 'Autàrtic',
	goalType: 'collective',
	capabilities: [lowKingdomStatGoalReaction('wealth')]
} satisfies GoalData;
