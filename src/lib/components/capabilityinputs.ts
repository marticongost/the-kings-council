import { getContext, setContext } from 'svelte';

/** An option of a select rendered for a player or kingdom input. */
export interface CapabilityInputChoice {
	value: string;
	label: string;
}

/**
 * State backing the editable `{input …}` fields of a capability. Values are keyed by the
 * path of the input, so every rendered input reads and writes its own entry.
 */
export interface CapabilityInputs {
	value(key: string): string;
	setValue(key: string, value: string): void;
	players: Array<CapabilityInputChoice>;
	kingdoms: Array<CapabilityInputChoice>;
}

const capabilityInputsKey = Symbol('capability-inputs');

export function provideCapabilityInputs(inputs: CapabilityInputs): void {
	setContext(capabilityInputsKey, inputs);
}

/** The inputs of the surrounding editable capability, or `null` when there is none. */
export function useCapabilityInputs(): CapabilityInputs | null {
	return getContext<CapabilityInputs | undefined>(capabilityInputsKey) ?? null;
}
