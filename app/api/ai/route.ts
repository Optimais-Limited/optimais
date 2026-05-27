import OpenAI from "openai";
import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { aiRequestSchema } from "@/lib/validators";

const featurePrompts: Record<string, string> = {
  "scholarship-recommender": "Recommend scholarship sources and next steps. Be practical, cite uncertainty, and remind users to verify official eligibility and deadlines.",
  "research-assistant": "Act as a research assistant for engineering, energy, AI, infrastructure, and development topics. Provide structured research directions and source suggestions.",
  "government-search": "Help identify government programs, procurement signals, policy opportunities, and institutional stakeholders. Do not claim live search unless provided data includes it.",
  "proposal-writer": "Draft clear proposal outlines, executive summaries, objectives, activities, risks, budgets, and monitoring plans.",
  "infrastructure-planner": "Assist with infrastructure planning. Include assumptions, constraints, phases, stakeholders, risks, and sustainability considerations.",
  recommendations: "Provide concise recommendations based on the supplied business, scholarship, project, or research context."
};

export async function POST(request: Request) {
  const parsed = aiRequestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid AI request.", details: parsed.error.flatten() }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY is not configured." }, { status: 503 });
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL || "gpt-5.4-mini";
  const { feature, prompt, context } = parsed.data;
  const system = featurePrompts[feature];

  const response = await client.responses.create({
    model,
    instructions: `${system} Never ask for or use private account passwords. Use only provided context and public information.`,
    input: JSON.stringify({ prompt, context: context ?? {} })
  });

  const result = response.output_text ?? "";

  await prisma.aiRequestLog.create({
    data: {
      feature,
      prompt,
      result,
      metadata: context as Prisma.InputJsonValue | undefined
    }
  });

  return NextResponse.json({ result });
}
