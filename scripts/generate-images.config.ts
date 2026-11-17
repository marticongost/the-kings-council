import { systemPrompt } from './image-generation.shared.ts';

export default {
	apiKey: process.env.GEMINI_API_KEY ?? '',
	model: 'gemini-3-pro-image-preview',
	aspectRatio: '3:2',
	imageSize: '1K',
	systemPrompt
};
