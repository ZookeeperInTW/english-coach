import { NextResponse } from "next/server";
import { fetchAndSyncNews } from "@/services/newsService";

export async function GET() {
  try {
    await fetchAndSyncNews();
    return NextResponse.json({ message: "Sync completed" });
  } catch (error) {
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
