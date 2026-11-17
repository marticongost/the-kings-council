import { systemPrompt } from './image-generation.shared.ts';

export default {
	apiKey: process.env.FAL_KEY ?? '',
	model: 'fal-ai/recraft/v4.1/pro/text-to-image',
	// Recraft snaps this to its largest supported size (2560×1664, ~4 MP) rather than honouring it.
	imageSize: { width: 3840, height: 2560 },
	systemPrompt
};
