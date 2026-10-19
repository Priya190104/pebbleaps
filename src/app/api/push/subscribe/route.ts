import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON tidak valid" }, { status: 400 });
  }
  if (!isRecord(body) || typeof body.endpoint !== "string") {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  }
  const endpoint = body.endpoint;
  const keys = body.keys;
  if (!isRecord(keys) || typeof keys.p256dh !== "string" || typeof keys.auth !== "string") {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  }
  const p256dh = keys.p256dh;
  const authKey = keys.auth;
  if (endpoint.length > 2048 || p256dh.length > 200 || authKey.length > 200) {
    return NextResponse.json({ error: "Data terlalu panjang" }, { status: 400 });
  }
  let endpointUrl: URL;
  try {
    endpointUrl = new URL(endpoint);
  } catch {
    return NextResponse.json({ error: "Endpoint tidak valid" }, { status: 400 });
  }
  if (endpointUrl.protocol !== "https:" || !p256dh || !authKey) {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  }

  await prisma.pushSubscription.upsert({
    where: { endpoint },
    update: { userId: session.user.id, p256dh, auth: authKey },
    create: {
      userId: session.user.id,
      endpoint,
      p256dh,
      auth: authKey,
    },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON tidak valid" }, { status: 400 });
  }
  if (!isRecord(body) || typeof body.endpoint !== "string") {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  }

  await prisma.pushSubscription.deleteMany({
    where: { endpoint: body.endpoint, userId: session.user.id },
  });
  return NextResponse.json({ ok: true });
}
