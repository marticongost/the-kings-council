/**
 * Production calculation shared by the rules' production table and the printed
 * kingdom sheets, so the amount produced for a given stat value is defined once.
 */

/** Production factors by kingdom stat value, following the production table in the rules. */
export const productionFactors = [
	{ value: 1, factor: 0.5 },
	{ value: 2, factor: 1 },
	{ value: 3, factor: 1.5 },
	{ value: 4, factor: 2 },
	{ value: 5, factor: 2.5 }
] as const;

/** The production factor of a kingdom stat value. Values outside 1-5 produce nothing. */
export function productionFactor(stat: number): number {
	return productionFactors.find(({ value }) => value === stat)?.factor ?? 0;
}

/** Units produced by a kingdom of `memberCount` members with the stat at `stat`. */
export function productionAmount(memberCount: number, stat: number): number {
	return Math.ceil(memberCount * productionFactor(stat));
}
