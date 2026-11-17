/**
 * Shared configuration for card image generation.
 *
 * `systemPrompt` is prepended to every prompt for both the Gemini and fal.ai
 * generators. Put common art-style indications here so they apply to both.
 *
 * This is the authoritative statement of the house style: per-card descriptions
 * must stay inside these bounds and only add subject, scene and framing, never a
 * competing medium or finish.
 */
export const systemPrompt = `
	You are an illustrator for The King's Council, a tabletop game of intrigue, commerce
	and political manoeuvring in a world resembling 13th century Western Europe.

	Generate a single card illustration suitable for printing. The art style is medieval
	manuscript, hand drawn miniatures with vibrant metallic and organic paints. The image
	should fill the entire canvas with no borders, frames, or text. Focus on the central
	subject with a dynamic composition appropriate for a collectible card.

	Keep it serious and historically accurate. No cleavage or sexualized imagery!
	`;
