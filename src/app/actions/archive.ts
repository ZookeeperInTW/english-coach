"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function archiveNews(newsId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("news")
    .update({ is_archived: true })
    .eq("id", newsId);

  if (error) {
    console.error("Failed to archive news:", error);
    return { error: "Failed to archive news" };
  }

  // Revalidate the home page to remove the archived news
  revalidatePath("/");

  return { success: true };
}
