import { validationFailure } from "@/lib/api-errors";
import OpenAI from "openai";
import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { aiRequestSchema } from "@/lib/validators";
import { consume } from "@/lib/rate-limit";

const AI_LIMIT = 10;
const AI_WINDOW_MS = 60_000;

const featurePrompts: Record<string, string> = {
  "scholarship-recommender": "Recommend scholarship sources and next steps. Be practical, cite uncertainty, and remind users to verify official eligibility and deadlines.",
  "research-assistant": "Act as a research assistant for engineering, energy, AI, infrastructure, and development topics. Provide structured research directions and source suggestions.",
  "government-search": "Help identify government programs, procurement signals, policy opportunities, and institutional stakeholders. Do not claim live search unless provided data includes it.",
  "proposal-writer": "Draft clear proposal outlines, executive summaries, objectives, activities, risks, budgets, and monitoring plans.",
  "infrastructure-planner": "Assist with infrastructure planning. Include assumptions, constraints, phases, stakeholders, risks, and sustainability considerations.",
  recommendations: "Provide concise recommendations based on the supplied business, scholarship, project, or research context."
};

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Please sign in to use this." }, { status: 401 });
  }
  const parsed = aiRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return validationFailure("Invalid AI request.", parsed.error);
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY is not configured." }, { status: 503 });
  }

  // Counted only once the request is valid and about to reach the provider, so a typo in the
  // payload doesn't use up the allowance.
  const limit = consume(`ai:${session.user.id}`, AI_LIMIT, AI_WINDOW_MS);
  if (limit.limited) {
    return NextResponse.json({ error: "Rate limit exceeded. Try again in a minute." }, { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } });
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL || "gpt-5.4-mini";
  const { feature, prompt, context } = parsed.data;
  const system = featurePrompts[feature];

  let result = "";
  try {
    const response = await client.responses.create({
      model,
      instructions: `${system} Never ask for or use private account passwords. Use only provided context and public information.`,
      input: JSON.stringify({ prompt, context: context ?? {} })
    });
    result = response.output_text ?? "";
  } catch (err) {
    console.error("OpenAI request failed:", err);
    return NextResponse.json({ error: "AI service is temporarily unavailable." }, { status: 502 });
  }

  // The answer is already paid for; a failed log write must not lose it.
  await prisma.aiRequestLog
    .create({ data: { feature, prompt, result, userId: session.user.id, metadata: context as Prisma.InputJsonValue | undefined } })
    .catch((err) => console.error("AI request log failed:", err));

  return NextResponse.json({ result });
}
