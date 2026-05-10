import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("news")
    .select("content_bilingual, title_zh")
    .eq("id", id)
    .single();
  return NextResponse.json(data ?? {});
}
