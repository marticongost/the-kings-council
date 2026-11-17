---
name: gen-image-fal
description: Orchestrate card image generation using the fal.ai-powered gen-image-fal script — find missing images, craft prompts from card data, and iteratively refine results.
---

# Generate card images with fal.ai

## When to use this skill

Use this skill when the user wants to generate, regenerate, or refine artwork for one or
more fate cards (events and crises) using fal.ai. Typical triggers:

- "Generate an image for \<card\>"
- "What cards are missing images?"
- "Redo the war image (use fal)"
- "The plague image looks wrong, make it darker"

## Setup check

All commands run from the repository root. The script requires `FAL_KEY` in `.env`.
Verify it is set before proceeding — if not, tell the user and stop.

Card artwork is imported by extension (`*.jpg`), so when the configured endpoint answers
with WebP or PNG the script transcodes it with ImageMagick (`magick` or `convert`, quality
92). If neither binary is installed, generation fails with an explicit error.

## Workflow

### 1. Find missing cards (if no specific card given)

```bash
npm run gen-image-fal -- missing
```

Present the list to the user and ask which card(s) to generate first.

### 2. Read the card data

Before writing a description, read the card's data file to understand what it does. Card
data lives under `src/lib/data/`:

- Events: `src/lib/data/events/{id}.ts`
- Crises: `src/lib/data/crisis/{id}.ts`

Use the card's **title** (in Catalan), its **capabilities** (actions and effects), its
**test** and **penalty** (for crises), and its **properties** (keywords like
_Adversitat_) to inform the visual description. The description should convey what the
card _is_ and _does_, not just its name.

### 3. Craft the description

The house style lives in exactly one place: the `systemPrompt` exported by
[scripts/image-generation.shared.ts](../../../scripts/image-generation.shared.ts). It is
prepended to every request by both generators, so **read it before writing** and treat it as
the single source of truth. Do not copy its vocabulary into this skill: derive the style from
the config each time you write a description, so that if the config changes, descriptions
follow it with no edit here.

The description adds only what the config cannot know: the card's own subject, scene and
framing. Everything the config already dictates — medium, technique, palette, tone, framing
rules, prohibited content — is honoured as-is and never contradicted.

Order the description like this:

1. **Style sentence, always first** — restate the configured medium in the config's own
   terms. The beginning of the prompt carries the most weight; a description that opens with
   the scene drifts away from the configured style.
2. **Subject and action** — the central figure or scene, what it is doing, the mood.
3. **Two or three concrete details** — equipment, wounds, environment, framing.

Rules:

- Never introduce a medium, finish or rendering the config does not ask for — no
  "photographic", "photorealistic", "cinematic", "digital painting", "3D render", "concept
  art", "hyperrealistic" unless the config calls for them.
- Avoid lighting and finish language that implies a different rendering — "volumetric
  light", "depth of field", "bokeh", "lens flare". Prefer the vocabulary the config uses for
  its own medium and palette.
- Composition cues are fine and useful ("close-up", "low angle", "crowded foreground",
  "symmetrical layout") — they change framing, not medium.
- Avoid abstract game mechanics — translate them into imagery.
- Keep it to about **3–4 sentences, 60–80 words**. The whole text is appended to the system
  prompt, and long scene prose lets the style direction drown.

Example for `war` — the opening sentence is filled from the shared config:

> "‹medium, technique and palette, exactly as the shared config states them›. Two armies clash
> on a muddy battlefield, banners tattered and spears levelled, smoke rising from a burning
> village beyond. Seen from within the front line."

### 4. Generate the image

For a new card with no prior task:

```bash
npm run gen-image-fal -- describe <card-id> "<description>"
```

If an image or task already exists and the user wants to start over:

```bash
npm run gen-image-fal -- describe <card-id> "<description>" --redo
```

### 5. Refine with amendments

If the user is unhappy with the result, collect their feedback and run:

```bash
npm run gen-image-fal -- amend <card-id> "<what to change>"
```

`amend` appends the amendment to the original description and generates a new image.
Unlike the Gemini version, fal.ai does not use the previous image as a reference — each
generation is independent.

Keep amendments focused — one or two specific changes per call works better than a long
list.

If the **whole look** is wrong (wrong medium, palette or period), do not stack amendments:
they are appended after the description and carry little weight, so a style amendment alone
may lose to the scene prose. Re-run with a style-led description instead:

```bash
npm run gen-image-fal -- describe <card-id> "<new style-led description>" --redo
```

Reserve `amend` for targeted scene fixes — pose, an object, a detail that is wrong.

### 6. Check status

```bash
npm run gen-image-fal -- status
```

Use this to show the user an overview of all tasks, especially when generating several
cards in sequence.

## Generating multiple cards

When generating several cards in one session:

1. Run `missing` to get the full list
2. For each card, read its data file, craft a description, and run `describe`
3. Run `status` after each batch to confirm progress
4. Address any `FAILED` tasks: read the error, adjust the description or check the API key,
   then retry with `--redo`

## Notes

- The generated image is saved immediately to `src/lib/assets/img/cards/{id}.jpg` and
  picked up by the web app automatically — no further import step needed.
- Only events and crises are expected to have generated artwork; other card types keep
  their SVG icons.
- The state file (`scripts/.image-gen-fal-state.json`) persists across sessions. A card's
  full amendment history is stored there.
- Use `-v` for verbose error output if a generation fails unexpectedly.
