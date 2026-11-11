import type { GoalData } from '#lib/models/cards';
import { lowKingdomStatGoalReaction } from '../reusable-definitions';

export default {
	title: 'Pacifista',
	goalType: 'collective',
	capabilities: [lowKingdomStatGoalReaction('might')]
} satisfies GoalData;
