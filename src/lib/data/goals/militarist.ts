import type { GoalData } from '#lib/models/cards';
import { highKingdomStatGoalReaction } from '../reusable-definitions';

export default {
	title: 'Militarista',
	goalType: 'collective',
	capabilities: [highKingdomStatGoalReaction('might')]
} satisfies GoalData;
