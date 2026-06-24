import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import { z } from "zod";

const SubmitRatingSchema = z.object({
  provider: z.string().refine(isAddress, "Invalid provider address"),
  score: z.number().int().min(1).max(5),
  paymentId: z.string().min(1).max(128),       // cap paymentId length
  rater: z.string().refine(isAddress, "Invalid rater address").optional(),
});

// In-memory log — capped at 500 entries to prevent memory DoS.
// Replace with supabase.from("ratings").insert() in production.
const ratingLog: Array<{
  provider: string;
  score: number;
  paymentId: string;
  rater?: string;
  submittedAt: string;
}> = [];

const MAX_LOG = 500;

export async function POST(req: NextRequest) {
  // Basic rate hint: reject bodies over 1KB (payloads have no reason to be larger)
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > 1024) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = SubmitRatingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { provider, score, paymentId, rater } = parsed.data;

  // Self-rating guard — if rater is provided it must not equal provider
  if (rater && rater.toLowerCase() === provider.toLowerCase()) {
    return NextResponse.json({ error: "Self-rating is not permitted" }, { status: 422 });
  }

  // Duplicate check — same rater + paymentId already rated
  const alreadyRated = ratingLog.some(
    (r) => r.paymentId === paymentId && r.rater === rater
  );
  if (alreadyRated) {
    return NextResponse.json(
      { error: "This payment has already been rated by this address" },
      { status: 409 }
    );
  }

  const entry = { provider, score, paymentId, rater, submittedAt: new Date().toISOString() };
  ratingLog.push(entry);

  // Enforce memory cap
  if (ratingLog.length > MAX_LOG) ratingLog.splice(0, ratingLog.length - MAX_LOG);

  return NextResponse.json({ success: true, entry });
}

export async function GET() {
  return NextResponse.json({ ratings: ratingLog.slice(-50) });
}
