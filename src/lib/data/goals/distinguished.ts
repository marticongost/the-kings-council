import type { GoalData } from '#lib/models/cards';
import { biggestHoarderGoalReaction } from '../reusable-definitions';

export default {
	title: 'Distingit',
	goalType: 'personal',
	capabilities: [biggestHoarderGoalReaction('{offices}')]
} satisfies GoalData;
