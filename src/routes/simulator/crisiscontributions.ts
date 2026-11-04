import type { Crisis } from '#lib/models/cards';
import { parse } from '#lib/models/effects';
import type { ResourceType } from '#lib/models/resources';
import { playerResourceTypes, type PlayerResourceType } from './types';

function isPlayerResourceType(resource: ResourceType): resource is PlayerResourceType {
	return (playerResourceTypes as ReadonlyArray<ResourceType>).includes(resource);
}

/**
 * The player resources a crisis accepts as contributions, taken from its test requirement.
 * Kingdom stats and any other directives in the test are not resources players contribute.
 * Favour is always a contribution option, regardless of the crisis requirement.
 */
export function crisisContributionResources(crisis: Crisis): Array<PlayerResourceType> {
	const resources: Array<PlayerResourceType> = ['favour'];

	for (const chunk of parse(crisis.test)) {
		if (chunk.type !== 'resource' || !isPlayerResourceType(chunk.resource)) continue;
		if (!resources.includes(chunk.resource)) resources.push(chunk.resource);
	}

	return resources;
}
