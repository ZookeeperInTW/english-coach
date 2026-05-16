import { NextResponse } from "next/server";
import { fetchAndSyncNews } from "@/services/newsService";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const forceClear = searchParams.get("forceClear") === "true";

  try {
    await fetchAndSyncNews(forceClear);
    return NextResponse.json({ success: true, cleared: forceClear });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    console.error("Sync failed:", error);
    return NextResponse.json(
      { error: "Sync failed", message, stack },
      { status: 500 }
    );
  }
}
