import { createClient } from "@supabase/supabase-js";

import { getDisplayItemMs } from "@/lib/display-config";
import {
  advanceDisplayQueue,
  ensureCurrentShowing,
} from "@/lib/display-queue-server";

function supabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/** ดึงรายการที่กำลังแสดง (และ promote จากคิว pending ถ้าจำเป็น) */
export async function GET() {
  try {
    const row = await ensureCurrentShowing(supabase());
    return Response.json({
      success: true,
      data: row ? [row] : [],
      intervalMs: getDisplayItemMs(),
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Fetch failed" }, { status: 500 });
  }
}

/** เลื่อนคิว: จบรอบปัจจุบัน แล้วแสดงรายการ pending ถัดไป */
export async function POST() {
  try {
    const row = await advanceDisplayQueue(supabase());
    return Response.json({
      success: true,
      data: row ? [row] : [],
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Advance failed" }, { status: 500 });
  }
}
