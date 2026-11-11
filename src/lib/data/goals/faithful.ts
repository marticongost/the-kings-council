import type { GoalData } from '#lib/models/cards';
import { highKingdomStatGoalReaction } from '../reusable-definitions';

export default {
	title: 'Creient',
	goalType: 'collective',
	capabilities: [highKingdomStatGoalReaction('grace')]
} satisfies GoalData;
