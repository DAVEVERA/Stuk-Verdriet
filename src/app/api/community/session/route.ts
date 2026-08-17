import { NextResponse } from "next/server";
import { getCommunityAccountSession } from "@/lib/community-session";

export async function GET() {
  const session = await getCommunityAccountSession();
  return NextResponse.json(session);
}
