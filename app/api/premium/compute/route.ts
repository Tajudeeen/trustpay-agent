import { NextRequest, NextResponse } from "next/server";
import { withPayment, type PaymentInfo } from "@/lib/x402/middleware";

export const POST = withPayment("0.0003", async (req: NextRequest, payment: PaymentInfo) => {
  let text = "";
  try {
    const body = await req.json();
    text = typeof body.text === "string" ? body.text.slice(0, 2000) : "";
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!text) {
    return NextResponse.json({ error: "body.text is required" }, { status: 400 });
  }

  const words = text.trim().split(/\s+/).filter(Boolean);
  const chars = text.length;
  const sentences = (text.match(/[.!?]+/g) ?? []).length || 1;
  const avgWordLength = words.length > 0
    ? (words.reduce((s, w) => s + w.length, 0) / words.length).toFixed(1)
    : "0";
  const uniqueWords = new Set(words.map((w) => w.toLowerCase())).size;
  const lexicalDiversity = words.length > 0
    ? (uniqueWords / words.length).toFixed(3)
    : "0";

  return NextResponse.json({
    analysis: {
      wordCount: words.length,
      charCount: chars,
      sentenceCount: sentences,
      avgWordLength,
      uniqueWords,
      lexicalDiversity,
    },
    payment: {
      payer: payment.payer,
      amount: payment.amount,
      network: payment.network,
    },
    processedAt: new Date().toISOString(),
  });
});
