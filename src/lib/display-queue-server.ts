import type { SupabaseClient } from "@supabase/supabase-js";

export type DisplayStatus = "pending" | "showing" | "done";

/** ดึงแถวที่กำลัง showing ถ้าไม่มีจะ promote pending ตัวเก่าสุดเป็น showing */
export async function ensureCurrentShowing(
  supabase: SupabaseClient
): Promise<Record<string, unknown> | null> {
  const { data: showing, error: errShowing } = await supabase
    .from("uploads")
    .select("*")
    .eq("display_status", "showing")
    .limit(1)
    .maybeSingle();

  if (errShowing) throw errShowing;
  if (showing) return showing as Record<string, unknown>;

  const { data: next, error: errNext } = await supabase
    .from("uploads")
    .select("*")
    .eq("display_status", "pending")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (errNext) throw errNext;
  if (!next) return null;

  const { data: promoted, error: errPromo } = await supabase
    .from("uploads")
    .update({ display_status: "showing" })
    .eq("id", (next as { id: string }).id)
    .eq("display_status", "pending")
    .select()
    .maybeSingle();

  if (errPromo) throw errPromo;
  if (promoted) return promoted as Record<string, unknown>;

  const { data: again } = await supabase
    .from("uploads")
    .select("*")
    .eq("display_status", "showing")
    .limit(1)
    .maybeSingle();

  return (again as Record<string, unknown>) ?? null;
}

/** จบรอบของรายการที่ showing แล้วดึง pending ถัดไปมาเป็น showing */
export async function advanceDisplayQueue(
  supabase: SupabaseClient
): Promise<Record<string, unknown> | null> {
  const { data: current } = await supabase
    .from("uploads")
    .select("id")
    .eq("display_status", "showing")
    .limit(1)
    .maybeSingle();

  if (current && "id" in current) {
    await supabase
      .from("uploads")
      .update({ display_status: "done" })
      .eq("id", (current as { id: string }).id);
  }

  return ensureCurrentShowing(supabase);
}
