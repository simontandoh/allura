// app/api/preorder/route.ts
import { NextResponse } from "next/server";

type PreorderPayload = {
  fullName?: string;
  email?: string;
  phone?: string;
  country?: string;
  acceptTerms?: boolean;
  source?: string;
};

type StoredPreorder = {
  id: string;
  createdAt: string;
  fullName: string;
  email: string;
  phone?: string;
  country: string;
  source?: string;
};

// NOTE: In-memory store (non-persistent). In serverless environments this can reset.
// TODO: Replace with Firebase (Firestore) or your preferred DB.
const memoryStore: StoredPreorder[] = [];

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as PreorderPayload;

    const fullName = (body.fullName || "").trim();
    const email = (body.email || "").trim();
    const phone = (body.phone || "").trim();
    const country = (body.country || "United Kingdom").trim();
    const acceptTerms = Boolean(body.acceptTerms);
    const source = body.source;

    if (!fullName) {
      return NextResponse.json(
        { ok: false, error: "Full name is required." },
        { status: 400 }
      );
    }

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { ok: false, error: "A valid email is required." },
        { status: 400 }
      );
    }

    if (!acceptTerms) {
      return NextResponse.json(
        { ok: false, error: "Terms must be accepted." },
        { status: 400 }
      );
    }

    const record: StoredPreorder = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      fullName,
      email,
      phone: phone || undefined,
      country: country || "United Kingdom",
      source,
    };

    memoryStore.push(record);

    // For now, log it (easy to replace later).
    console.log("[PREORDER] New reservation:", record);
    console.log("[PREORDER] Total in memory:", memoryStore.length);

    // TODO: Persist to Firebase (Firestore):
    // - initialise Firebase Admin SDK
    // - write to `preorders` collection
    // - optionally dedupe by email

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[PREORDER] Error:", err);
    return NextResponse.json(
      { ok: false, error: "Invalid request." },
      { status: 400 }
    );
  }
}
