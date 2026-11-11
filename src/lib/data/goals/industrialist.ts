import type { GoalData } from '#lib/models/cards';
import { highKingdomStatGoalReaction } from '../reusable-definitions';

export default {
	title: 'Industrialista',
	goalType: 'collective',
	capabilities: [highKingdomStatGoalReaction('wealth')]
} satisfies GoalData;
