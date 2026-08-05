import { macroEstimateSchema } from '@gym-bro/shared';
import type { MacroEstimate } from '@gym-bro/shared';

import { env } from '../../lib/env';

// Gemini 2.0 Flash over the REST API (native fetch, no SDK). Free-tier friendly and
// supports vision + JSON-constrained output, which is all this feature needs.
const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// The JSON shape Gemini is forced to return (OpenAPI-subset responseSchema). It mirrors
// macroEstimateSchema, which then validates the parsed output as a second line of
// defence — the model can still drift, so we never trust it blindly.
const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    name: { type: 'STRING', nullable: true },
    kcal: { type: 'NUMBER' },
    proteinG: { type: 'NUMBER' },
    carbsG: { type: 'NUMBER' },
    fatG: { type: 'NUMBER' },
  },
  required: ['name', 'kcal', 'proteinG', 'carbsG', 'fatG'],
} as const;

// Thrown for every failure mode (missing key, unreachable, bad/malformed output) so the
// route can surface one clean 503 instead of leaking provider details.
export class AiUnavailableError extends Error {}

function buildPrompt(description: string | undefined): string {
  const base =
    'You are a nutrition assistant. Estimate the total macronutrients of the food shown ' +
    'in the photo for the WHOLE portion visible (not per 100g). Return kcal and grams of ' +
    'protein, carbs and fat as numbers, plus a short lowercase dish name (or null if you ' +
    "can't tell). Give your single best estimate even when unsure.";
  const note = description?.trim();
  return note
    ? `${base}\nUser note about the food (use it to judge portion and ingredients): ${note}`
    : base;
}

// Split a data-URI ("data:image/jpeg;base64,AAAA...") into the mime type + raw base64
// that Gemini's inline_data part expects. Null when it isn't a base64 image data-URI.
function parseDataUri(image: string): { mimeType: string; data: string } | null {
  const match = /^data:(image\/[a-z0-9.+-]+);base64,(.+)$/i.exec(image);
  if (!match?.[1] || !match[2]) return null;
  return { mimeType: match[1], data: match[2] };
}

// An empty name from the model means "couldn't tell" — normalise it to null so it
// satisfies the schema (name is min(1) or null) instead of failing validation.
function normaliseName(json: unknown): unknown {
  if (json && typeof json === 'object' && 'name' in json) {
    const record = json as Record<string, unknown>;
    if (typeof record.name === 'string' && record.name.trim() === '') {
      record.name = null;
    }
  }
  return json;
}

// Estimate macros for a food photo (+ optional user note). Nothing is persisted; the
// caller reviews the returned estimate and saves it as a 'custom' food-log entry.
export async function estimateMacrosFromPhoto(
  image: string,
  description?: string,
): Promise<MacroEstimate> {
  if (!env.GEMINI_API_KEY) {
    throw new AiUnavailableError('Photo estimation is not configured');
  }
  const parts = parseDataUri(image);
  if (!parts) {
    throw new AiUnavailableError('Unsupported image format');
  }

  let res: Response;
  try {
    res = await fetch(`${GEMINI_URL}?key=${env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: buildPrompt(description) },
              { inline_data: { mime_type: parts.mimeType, data: parts.data } },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: RESPONSE_SCHEMA,
          temperature: 0.2,
        },
      }),
    });
  } catch {
    throw new AiUnavailableError('Could not reach the estimation service');
  }
  if (!res.ok) {
    throw new AiUnavailableError('The estimation service returned an error');
  }

  const body = (await res.json().catch(() => null)) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  } | null;
  const text = body?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new AiUnavailableError('The estimation service returned no result');
  }

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new AiUnavailableError('Could not parse the estimate');
  }
  const parsed = macroEstimateSchema.safeParse(normaliseName(json));
  if (!parsed.success) {
    throw new AiUnavailableError('The estimate was malformed');
  }
  return parsed.data;
}
