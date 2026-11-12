import type { GoalData } from '#lib/models/cards';
import { biggestHoarderGoalReaction } from '../reusable-definitions';

export default {
	title: 'Calculador',
	goalType: 'personal',
	capabilities: [biggestHoarderGoalReaction('{intrigue}')]
} satisfies GoalData;
