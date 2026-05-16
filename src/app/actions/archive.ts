"use server";

import sql from "@/utils/db";
import { revalidatePath } from "next/cache";

export async function archiveNews(newsId: string) {
  try {
    await sql`UPDATE news SET is_archived = TRUE WHERE id = ${newsId}`;
  } catch (error) {
    console.error("Failed to archive news:", error);
    return { error: "Failed to archive news" };
  }

  revalidatePath("/");
  return { success: true };
}
